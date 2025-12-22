import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { DataService } from '../utils/dataService';
import { LoadingCard, LoadingSpinner } from './ui/loading';
import { ErrorAlert } from './ui/error';

interface RealtorPartner {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  assignedLOs: Array<{id: string; name: string}>;
  isPartneredWithCurrentLO: boolean;
}

export function RealtorAssignment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [realtors, setRealtors] = useState<RealtorPartner[]>([]);
  const [filteredRealtors, setFilteredRealtors] = useState<RealtorPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      loadRealtorPartners();
    }
  }, [isModalOpen]);

  useEffect(() => {
    // Filter realtors based on search term
    const filtered = realtors.filter(realtor =>
      realtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      realtor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRealtors(filtered);
  }, [realtors, searchTerm]);

  const loadRealtorPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DataService.getAllRealtorPartners();
      setRealtors(data);
    } catch (error) {
      setError('Failed to load realtor partners');
      console.error('Error loading realtor partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRealtor = async (realtorId: string) => {
    try {
      setAssigning(realtorId);
      setError(null);

      const success = await DataService.assignRealtorToLO(realtorId);

      if (success) {
        // Refresh the list to show updated assignments
        await loadRealtorPartners();
      } else {
        setError('Failed to assign realtor partner');
      }
    } catch (error) {
      setError('Error assigning realtor partner');
      console.error('Error assigning realtor:', error);
    } finally {
      setAssigning(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRealtorStats = () => {
    const total = realtors.length;
    const partnered = realtors.filter(r => r.isPartneredWithCurrentLO).length;
    const available = total - partnered;

    return { total, partnered, available };
  };

  const stats = getRealtorStats();

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Existing Realtor
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Assign Realtor Partners</DialogTitle>
            <DialogDescription>
              Select from existing realtor partners to create new partnerships. One realtor can work with multiple loan officers.
            </DialogDescription>
          </DialogHeader>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-white">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Total Realtors</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Partnered with You</p>
                    <p className="text-2xl font-bold">{stats.partnered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold">{stats.available}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {error && (
            <ErrorAlert
              title="Assignment Error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {loading ? (
            <LoadingCard />
          ) : (
            <div className="border rounded-md bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Realtor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Current Partnerships</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRealtors.map((realtor) => (
                    <TableRow key={realtor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {realtor.name}
                        </div>
                      </TableCell>
                      <TableCell>{realtor.email}</TableCell>
                      <TableCell>{formatDate(realtor.joinDate)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {realtor.assignedLOs.length === 0 ? (
                            <span className="text-sm text-muted-foreground">None</span>
                          ) : (
                            realtor.assignedLOs.map((lo) => (
                              <Badge key={lo.id} variant="secondary" className="text-xs">
                                {lo.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {realtor.isPartneredWithCurrentLO ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Partnered
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={realtor.isPartneredWithCurrentLO || assigning === realtor.id}
                          onClick={() => handleAssignRealtor(realtor.id)}
                          className="min-w-[80px]"
                        >
                          {assigning === realtor.id ? (
                            <LoadingSpinner size="sm" />
                          ) : realtor.isPartneredWithCurrentLO ? (
                            'Assigned'
                          ) : (
                            'Assign'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRealtors.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Users className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            {searchTerm ? 'No realtors match your search' : 'No realtor partners found'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}