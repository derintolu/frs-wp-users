<?php
/**
 * Eloquent Data Source for DataKit
 *
 * Provides a DataKit DataSource backed by Eloquent ORM models.
 * Supports filtering, sorting, searching, and pagination at the database level.
 *
 * @package FRSUsers\DataKit
 * @since   1.0.0
 */

namespace FRSUsers\DataKit;

use DataKit\DataViews\Data\BaseDataSource;
use DataKit\DataViews\Data\MutableDataSource;
use DataKit\DataViews\Data\Exception\DataNotFoundException;
use DataKit\DataViews\DataView\Filters;
use DataKit\DataViews\DataView\Sort;
use Prappo\WpEloquent\Database\Eloquent\Model;
use Prappo\WpEloquent\Database\Eloquent\Builder;

defined( 'ABSPATH' ) || exit;

/**
 * Class EloquentDataSource
 *
 * A DataKit DataSource that wraps an Eloquent model for efficient database queries.
 *
 * Usage:
 * ```php
 * $data_source = new EloquentDataSource(
 *     'profiles',
 *     Profile::class,
 *     function($profile) {
 *         return [
 *             'id' => (string) $profile->id,
 *             'display_name' => $profile->first_name . ' ' . $profile->last_name,
 *             'email' => $profile->email,
 *         ];
 *     }
 * );
 * ```
 *
 * @since 1.0.0
 */
class EloquentDataSource extends BaseDataSource implements MutableDataSource {

	/**
	 * The unique ID for the data source.
	 *
	 * @var string
	 */
	private string $id;

	/**
	 * The Eloquent model class name.
	 *
	 * @var string
	 */
	private string $model_class;

	/**
	 * Callback to transform model to array.
	 *
	 * @var callable
	 */
	private $transformer;

	/**
	 * Base query modifier callback.
	 *
	 * @var callable|null
	 */
	private $base_query_modifier;

	/**
	 * Field mappings for filtering/sorting (DataKit field => DB column).
	 *
	 * @var array<string, string>
	 */
	private array $field_mappings = [];

	/**
	 * Searchable fields (DB columns).
	 *
	 * @var array<string>
	 */
	private array $searchable_fields = [];

	/**
	 * Whether deletions are allowed.
	 *
	 * @var bool
	 */
	private bool $allow_delete = false;

	/**
	 * Creates the Eloquent data source.
	 *
	 * @param string        $id                   The data source identifier.
	 * @param string        $model_class          The Eloquent model class name.
	 * @param callable      $transformer          Callback to transform model to array: fn(Model $model): array.
	 * @param callable|null $base_query_modifier  Optional callback to modify base query: fn(Builder $query): Builder.
	 */
	public function __construct(
		string $id,
		string $model_class,
		callable $transformer,
		?callable $base_query_modifier = null
	) {
		$this->id                  = $id;
		$this->model_class         = $model_class;
		$this->transformer         = $transformer;
		$this->base_query_modifier = $base_query_modifier;
	}

	/**
	 * Set field mappings for filtering/sorting.
	 *
	 * @param array<string, string> $mappings DataKit field => DB column mappings.
	 * @return self
	 */
	public function set_field_mappings( array $mappings ): self {
		$this->field_mappings = $mappings;
		return $this;
	}

	/**
	 * Set searchable fields.
	 *
	 * @param array<string> $fields DB column names that are searchable.
	 * @return self
	 */
	public function set_searchable_fields( array $fields ): self {
		$this->searchable_fields = $fields;
		return $this;
	}

	/**
	 * Enable or disable deletion.
	 *
	 * @param bool $allow Whether to allow deletion.
	 * @return self
	 */
	public function allow_delete( bool $allow = true ): self {
		$this->allow_delete = $allow;
		return $this;
	}

	/**
	 * @inheritDoc
	 */
	public function id(): string {
		return $this->id;
	}

	/**
	 * Get the base query with any modifiers applied.
	 *
	 * @return Builder
	 */
	private function get_base_query(): Builder {
		$model_class = $this->model_class;
		$query       = $model_class::query();

		if ( $this->base_query_modifier ) {
			$query = call_user_func( $this->base_query_modifier, $query );
		}

		return $query;
	}

	/**
	 * Apply filters, sorting, and search to a query.
	 *
	 * @param Builder $query The base query.
	 * @return Builder
	 */
	private function apply_query_modifiers( Builder $query ): Builder {
		// Apply search
		if ( $this->search && ! empty( $this->searchable_fields ) ) {
			$search_term = (string) $this->search;
			if ( ! empty( $search_term ) ) {
				$query->where( function ( $q ) use ( $search_term ) {
					foreach ( $this->searchable_fields as $index => $field ) {
						if ( $index === 0 ) {
							$q->where( $field, 'LIKE', '%' . $search_term . '%' );
						} else {
							$q->orWhere( $field, 'LIKE', '%' . $search_term . '%' );
						}
					}
				} );
			}
		}

		// Apply filters
		if ( $this->filters ) {
			foreach ( $this->filters->to_array() as $filter ) {
				$field    = $filter['field'] ?? '';
				$operator = $filter['operator'] ?? 'is';
				$value    = $filter['value'] ?? '';

				// Map field name if mapping exists
				$db_column = $this->field_mappings[ $field ] ?? $field;

				switch ( $operator ) {
					case 'is':
						if ( is_array( $value ) ) {
							$query->whereIn( $db_column, $value );
						} else {
							$query->where( $db_column, '=', $value );
						}
						break;
					case 'isNot':
						if ( is_array( $value ) ) {
							$query->whereNotIn( $db_column, $value );
						} else {
							$query->where( $db_column, '!=', $value );
						}
						break;
					case 'isAny':
						if ( is_array( $value ) ) {
							$query->whereIn( $db_column, $value );
						}
						break;
					case 'isNone':
						if ( is_array( $value ) ) {
							$query->whereNotIn( $db_column, $value );
						}
						break;
					case 'isAll':
						// For JSON arrays, check if all values are present
						if ( is_array( $value ) ) {
							foreach ( $value as $v ) {
								$query->whereJsonContains( $db_column, $v );
							}
						}
						break;
					case 'isNotAll':
						// Exclude if any of the values are present
						if ( is_array( $value ) ) {
							$query->where( function ( $q ) use ( $db_column, $value ) {
								foreach ( $value as $v ) {
									$q->orWhereJsonDoesntContain( $db_column, $v );
								}
							} );
						}
						break;
				}
			}
		}

		// Apply sorting
		if ( $this->sort ) {
			$sort_data  = $this->sort->to_array();
			$sort_field = $sort_data['field'] ?? 'id';
			$sort_dir   = $sort_data['direction'] ?? Sort::ASC;

			// Map field name if mapping exists
			$db_column = $this->field_mappings[ $sort_field ] ?? $sort_field;
			$query->orderBy( $db_column, $sort_dir );
		}

		return $query;
	}

	/**
	 * @inheritDoc
	 */
	public function get_data_ids( int $limit = 20, int $offset = 0 ): array {
		$query = $this->get_base_query();
		$query = $this->apply_query_modifiers( $query );

		$ids = $query->skip( $offset )
			->take( $limit )
			->pluck( 'id' )
			->map( fn( $id ) => (string) $id )
			->toArray();

		return $ids;
	}

	/**
	 * @inheritDoc
	 */
	public function get_data_by_id( string $id ): array {
		$model_class = $this->model_class;
		$model       = $model_class::find( (int) $id );

		if ( ! $model ) {
			throw DataNotFoundException::with_id( $this, $id );
		}

		$data       = call_user_func( $this->transformer, $model );
		$data['id'] = (string) $id;

		return $data;
	}

	/**
	 * @inheritDoc
	 */
	public function count(): int {
		$query = $this->get_base_query();
		$query = $this->apply_query_modifiers( $query );

		return $query->count();
	}

	/**
	 * @inheritDoc
	 */
	public function get_fields(): array {
		// Return field mappings as available fields
		$fields = [];
		foreach ( $this->field_mappings as $datakit_field => $db_column ) {
			$fields[ $datakit_field ] = ucwords( str_replace( '_', ' ', $datakit_field ) );
		}
		return $fields;
	}

	/**
	 * @inheritDoc
	 */
	public function can_delete(): bool {
		return $this->allow_delete;
	}

	/**
	 * @inheritDoc
	 */
	public function delete_data_by_id( string ...$ids ): void {
		if ( ! $this->allow_delete ) {
			throw new \RuntimeException( 'Deletion is not allowed for this data source.' );
		}

		$model_class = $this->model_class;

		foreach ( $ids as $id ) {
			$model = $model_class::find( (int) $id );
			if ( ! $model ) {
				throw DataNotFoundException::with_id( $this, $id );
			}
			$model->delete();
		}
	}
}
