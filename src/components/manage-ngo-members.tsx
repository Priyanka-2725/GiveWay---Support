'use client';

import { useState } from 'react';
import { NGO } from '@/types';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Shield, ShieldAlert, Trash2 } from 'lucide-react';

type ManageNgoMembersProps = {
  ngo: NGO;
  currentUserId: string;
};

export default function ManageNgoMembers({ ngo, currentUserId }: ManageNgoMembersProps) {
  const { toast } = useToast();
  const [newUid, setNewUid] = useState('');
  const [newRole, setNewRole] = useState<'manager' | 'owner'>('manager');
  const [members, setMembers] = useState<Record<string, 'owner' | 'manager'>>(ngo.members || {});

  const currentUserRole = members[currentUserId] || 'none';
  const isOwner = currentUserRole === 'owner';

  const updateMembers = async (updatedMembers: Record<string, 'owner' | 'manager'>) => {
    try {
      await apiClient.updateNgo(ngo.id, { members: updatedMembers });
      setMembers(updatedMembers);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: e.message });
    }
  };

  const handleAddMember = async () => {
    if (!newUid) return;
    const updatedMembers = { ...members, [newUid]: newRole };
    await updateMembers(updatedMembers);
    toast({ title: 'Member Added', description: `User ${newUid} has been added as a ${newRole}.` });
    setNewUid('');
  };

  const handleRemoveMember = async (uid: string) => {
    if (uid === currentUserId && isOwner) {
      const owners = Object.values(members).filter(r => r === 'owner');
      if (owners.length <= 1) {
        toast({
          variant: 'destructive',
          title: 'Cannot Remove Self',
          description: 'You are the only owner. Promote another member to owner first.',
        });
        return;
      }
    }
    const updatedMembers = { ...members };
    delete updatedMembers[uid];
    await updateMembers(updatedMembers);
    toast({ title: 'Member Removed', description: 'The user has been removed from the organization.' });
  };

  const handleChangeRole = async (uid: string, role: 'owner' | 'manager') => {
    const updatedMembers = { ...members, [uid]: role };
    await updateMembers(updatedMembers);
    toast({ title: 'Role Updated', description: `User role changed to ${role}.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Management
        </CardTitle>
        <CardDescription>Manage who can access and edit this NGO's profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isOwner && (
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-secondary/20 rounded-xl border border-primary/10">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">User ID</label>
              <Input
                placeholder="Enter user ID"
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40 space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Role</label>
              <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddMember} disabled={!newUid} className="w-full md:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Role</TableHead>
              {isOwner && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(members).map(([uid, role]) => (
              <TableRow key={uid}>
                <TableCell className="font-mono text-xs">
                  {uid} {uid === currentUserId && <Badge className="ml-2">You</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {role === 'owner' ? (
                      <Shield className="h-3 w-3 text-primary" />
                    ) : (
                      <Users className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="capitalize">{role}</span>
                  </div>
                </TableCell>
                {isOwner && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select
                        value={role}
                        onValueChange={(v: any) => handleChangeRole(uid, v)}
                        disabled={uid === currentUserId}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveMember(uid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!isOwner && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
            <ShieldAlert className="h-4 w-4" />
            Only owners can manage team members and roles.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
