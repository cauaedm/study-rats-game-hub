import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [metric, setMetric] = useState("total_hours");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("group_members")
      .select(
        `
        *,
        groups (*)
      `
      )
      .eq("user_id", user.id);

    setGroups(data?.map((item) => item.groups) || []);
  };

  const createGroup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        creator_id: user.id,
        metric,
        end_date: new Date(endDate).toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar grupo");
      return;
    }

    // Add creator as member
    await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
    });

    toast.success("Grupo criado!");
    setOpen(false);
    loadGroups();
    setGroupName("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Meus Grupos</h1>
              <p className="text-muted-foreground">Compete com amigos e alcance novos objetivos</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover:opacity-90 transition-opacity">
                <Plus className="mr-2 h-4 w-4" />
                Criar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nome do Grupo</Label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ex: Vestibular 2025"
                  />
                </div>
                <div>
                  <Label>Métrica de Competição</Label>
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total_hours">Horas Totais</SelectItem>
                      <SelectItem value="streak">Maior Streak</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Término</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <Button
                  onClick={createGroup}
                  className="w-full gradient-primary hover:opacity-90 transition-opacity"
                >
                  Criar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {groups.length === 0 ? (
          <Card className="p-12 text-center shadow-card animate-scale-in">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum grupo ainda</h3>
            <p className="text-muted-foreground mb-6">
              Crie um grupo para competir com seus amigos!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 shadow-card hover:shadow-soft transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(group.end_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg gradient-accent">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Métrica: {group.metric === "total_hours" ? "Horas Totais" : group.metric === "streak" ? "Streak" : "Custom"}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
