<?php
/**
 * FluentCRM Subscriber Model
 *
 * Eloquent model for the FluentCRM subscribers table.
 * This eliminates the need for raw SQL queries.
 *
 * @package FRSUsers
 * @subpackage Models
 * @since 1.0.0
 */

namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

/**
 * Class FluentCRMSubscriber
 *
 * Represents a FluentCRM subscriber record.
 *
 * @package FRSUsers\Models
 *
 * @property int $id
 * @property string $email
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string $status
 * @property string $created_at
 * @property string $updated_at
 */
class FluentCRMSubscriber extends Model {

	/**
	 * The table associated with the model.
	 *
	 * @var string
	 */
	protected $table = 'fc_subscribers';

	/**
	 * The primary key for the model.
	 *
	 * @var string
	 */
	protected $primaryKey = 'id';

	/**
	 * Indicates if the model should be timestamped.
	 *
	 * @var bool
	 */
	public $timestamps = true;
}
