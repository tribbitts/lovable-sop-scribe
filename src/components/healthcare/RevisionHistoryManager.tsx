import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, CheckCircle, Clock, User, Calendar } from "lucide-react";
import { RevisionHistoryEntry, ApprovalSignature } from "@/types/sop";
import { v4 as uuidv4 } from "uuid";

interface RevisionHistoryManagerProps {
  revisionHistory: RevisionHistoryEntry[];
  approvalSignatures: ApprovalSignature[];
  onUpdateRevisionHistory: (history: RevisionHistoryEntry[]) => void;
  onUpdateApprovalSignatures: (signatures: ApprovalSignature[]) => void;
}

const RevisionHistoryManager: React.FC<RevisionHistoryManagerProps> = ({
  revisionHistory,
  approvalSignatures,
  onUpdateRevisionHistory,
  onUpdateApprovalSignatures
}) => {
  const [newRevision, setNewRevision] = useState<Omit<RevisionHistoryEntry, "id">>({
    version: "",
    date: new Date().toISOString().split('T')[0],
    changes: "",
    author: "",
    approved: false
  });

  const [newApproval, setNewApproval] = useState<Omit<ApprovalSignature, "id">>({
    role: "",
    name: "",
    approved: false
  });

  const addRevision = () => {
    if (newRevision.version && newRevision.changes && newRevision.author) {
      const revision: RevisionHistoryEntry = {
        ...newRevision,
        id: uuidv4()
      };
      onUpdateRevisionHistory([...revisionHistory, revision]);
      setNewRevision({
        version: "",
        date: new Date().toISOString().split('T')[0],
        changes: "",
        author: "",
        approved: false
      });
    }
  };

  const addApprovalSignature = () => {
    if (newApproval.role && newApproval.name) {
      const approval: ApprovalSignature = {
        ...newApproval,
        id: uuidv4()
      };
      onUpdateApprovalSignatures([...approvalSignatures, approval]);
      setNewApproval({
        role: "",
        name: "",
        approved: false
      });
    }
  };

  const toggleApproval = (id: string) => {
    onUpdateApprovalSignatures(
      approvalSignatures.map(sig => 
        sig.id === id 
          ? { 
              ...sig, 
              approved: !sig.approved,
              date: !sig.approved ? new Date().toISOString().split('T')[0] : undefined
            }
          : sig
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Revision History */}
      <Card className="bg-[#1E1E1E] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Revision History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Revisions */}
          {revisionHistory.length > 0 && (
            <div className="space-y-3">
              {revisionHistory.map((revision, index) => (
                <div key={revision.id} className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600 text-white">v{revision.version}</Badge>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Calendar className="h-4 w-4" />
                        {revision.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <User className="h-4 w-4" />
                        {revision.author}
                      </div>
                    </div>
                    {revision.approved && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                  </div>
                  <p className="text-zinc-300 text-sm">{revision.changes}</p>
                  {revision.approver && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Approved by {revision.approver} on {revision.approvalDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Revision */}
          <div className="p-4 border-2 border-dashed border-zinc-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input
                placeholder="Version (e.g., 1.2)"
                value={newRevision.version}
                onChange={(e) => setNewRevision(prev => ({ ...prev, version: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                type="date"
                value={newRevision.date}
                onChange={(e) => setNewRevision(prev => ({ ...prev, date: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                placeholder="Author name"
                value={newRevision.author}
                onChange={(e) => setNewRevision(prev => ({ ...prev, author: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Textarea
              placeholder="Describe the changes made in this revision..."
              value={newRevision.changes}
              onChange={(e) => setNewRevision(prev => ({ ...prev, changes: e.target.value }))}
              className="bg-zinc-800 border-zinc-700 text-white mb-3"
            />
            <Button
              onClick={addRevision}
              disabled={!newRevision.version || !newRevision.changes || !newRevision.author}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Revision
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval Signatures */}
      <Card className="bg-[#1E1E1E] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Approval Signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Approvals */}
          {approvalSignatures.length > 0 && (
            <div className="space-y-3">
              {approvalSignatures.map((signature) => (
                <div key={signature.id} className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-white">{signature.name}</span>
                        <Badge variant="outline" className="text-zinc-400 border-zinc-600">
                          {signature.role}
                        </Badge>
                      </div>
                      {signature.approved && signature.date && (
                        <p className="text-sm text-zinc-400">Approved on {signature.date}</p>
                      )}
                    </div>
                    <Button
                      variant={signature.approved ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleApproval(signature.id)}
                      className={signature.approved 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      }
                    >
                      {signature.approved ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approved
                        </>
                      ) : (
                        "Pending"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Approval */}
          <div className="p-4 border-2 border-dashed border-zinc-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Input
                placeholder="Role (e.g., Department Head)"
                value={newApproval.role}
                onChange={(e) => setNewApproval(prev => ({ ...prev, role: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                placeholder="Full name"
                value={newApproval.name}
                onChange={(e) => setNewApproval(prev => ({ ...prev, name: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button
              onClick={addApprovalSignature}
              disabled={!newApproval.role || !newApproval.name}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Approver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevisionHistoryManager;
