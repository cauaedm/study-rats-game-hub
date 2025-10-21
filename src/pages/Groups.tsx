import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trophy, Users, TrendingUp, Home, Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { GroupRanking } from "@/components/GroupRanking";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [publicGroups, setPublicGroups] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [metric, setMetric] = useState("total_hours");
  const [endDate, setEndDate] = useState("");
  const [password, setPassword] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedPublicGroup, setSelectedPublicGroup] = useState<any>(null);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadGroups();
    loadPublicGroups();
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

  const loadPublicGroups = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("is_public", true);

    if (!data) return;

    // Filter out groups the user is already a member of
    const { data: memberGroups } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    const memberGroupIds = memberGroups?.map((mg) => mg.group_id) || [];
    const availableGroups = data.filter((g) => !memberGroupIds.includes(g.id));

    setPublicGroups(availableGroups);
  };

  const loadGroupMembers = async (groupId: string, groupMetric: string) => {
    const { data: members } = await supabase
      .from("group_members")
      .select(
        `
        user_id,
        profiles (
          name,
          total_hours,
          streak
        )
      `
      )
      .eq("group_id", groupId);

    if (!members) return;

    const ranking = members
      .map((member: any) => ({
        user_id: member.user_id,
        name: member.profiles?.name || "Usuário",
        value:
          groupMetric === "total_hours"
            ? Number(member.profiles?.total_hours || 0)
            : Number(member.profiles?.streak || 0),
      }))
      .sort((a, b) => b.value - a.value)
      .map((member, index) => ({
        ...member,
        position: index + 1,
      }));

    setGroupMembers(ranking);
  };

  const openGroupRanking = async (group: any) => {
    setSelectedGroup(group);
    await loadGroupMembers(group.id, group.metric);
    setRankingOpen(true);
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
        password: password || null,
        is_public: isPublic,
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
    loadPublicGroups();
    setGroupName("");
    setEndDate("");
    setPassword("");
    setIsPublic(true);
  };

  const openJoinDialog = (group: any) => {
    setSelectedPublicGroup(group);
    setJoinDialogOpen(true);
  };

  const joinGroup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !selectedPublicGroup) return;

    // Verificar senha se o grupo tiver uma
    if (selectedPublicGroup.password && selectedPublicGroup.password !== enteredPassword) {
      toast.error("Senha incorreta!");
      return;
    }

    const { error } = await supabase.from("group_members").insert({
      group_id: selectedPublicGroup.id,
      user_id: user.id,
    });

    if (error) {
      toast.error("Erro ao entrar no grupo");
      return;
    }

    toast.success("Você entrou no grupo!");
    setJoinDialogOpen(false);
    setEnteredPassword("");
    loadGroups();
    loadPublicGroups();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    Tornar grupo público (outros usuários poderão encontrá-lo)
                  </Label>
                </div>
                <div>
                  <Label>Senha (opcional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Deixe vazio se não quiser senha"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se definir uma senha, usuários precisarão dela para entrar
                  </p>
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

        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-groups">Meus Grupos</TabsTrigger>
            <TabsTrigger value="discover">
              <Search className="mr-2 h-4 w-4" />
              Descobrir Grupos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="mt-6">
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
                  <Card
                    key={group.id}
                    className="p-6 shadow-card hover:shadow-soft transition-all cursor-pointer hover-scale"
                    onClick={() => openGroupRanking(group)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{group.name}</h3>
                          {group.password && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Termina em {new Date(group.end_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg gradient-accent">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <TrendingUp className="h-4 w-4" />
                      Métrica:{" "}
                      {group.metric === "total_hours"
                        ? "Horas Totais"
                        : group.metric === "streak"
                        ? "Streak"
                        : "Custom"}
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Ver Ranking
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            <div className="mb-4">
              <Input
                placeholder="Buscar grupos públicos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {publicGroups.filter((g) => 
              g.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <Card className="p-12 text-center shadow-card animate-scale-in">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum grupo disponível</h3>
                <p className="text-muted-foreground">
                  Não há grupos públicos disponíveis no momento.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {publicGroups
                  .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((group) => (
                    <Card
                      key={group.id}
                      className="p-6 shadow-card hover:shadow-soft transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{group.name}</h3>
                            {group.password && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Termina em {new Date(group.end_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg gradient-primary">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <TrendingUp className="h-4 w-4" />
                        Métrica:{" "}
                        {group.metric === "total_hours"
                          ? "Horas Totais"
                          : group.metric === "streak"
                          ? "Streak"
                          : "Custom"}
                      </div>
                      <Button
                        className="w-full gradient-primary hover:opacity-90"
                        size="sm"
                        onClick={() => openJoinDialog(group)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Entrar no Grupo
                      </Button>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={rankingOpen} onOpenChange={setRankingOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="h-6 w-6 text-primary" />
                {selectedGroup?.name}
              </DialogTitle>
              <p className="text-muted-foreground">
                Competição:{" "}
                {selectedGroup?.metric === "total_hours"
                  ? "Horas Totais"
                  : selectedGroup?.metric === "streak"
                  ? "Maior Streak"
                  : "Personalizado"}
              </p>
              <p className="text-sm text-muted-foreground">
                Termina em {selectedGroup?.end_date && new Date(selectedGroup.end_date).toLocaleDateString("pt-BR")}
              </p>
            </DialogHeader>
            <div className="mt-6">
              <GroupRanking members={groupMembers} metric={selectedGroup?.metric || "total_hours"} />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Entrar no Grupo: {selectedPublicGroup?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedPublicGroup?.password && (
                <div>
                  <Label>Senha do Grupo</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={enteredPassword}
                      onChange={(e) => setEnteredPassword(e.target.value)}
                      placeholder="Digite a senha do grupo"
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Métrica:</strong>{" "}
                  {selectedPublicGroup?.metric === "total_hours"
                    ? "Horas Totais"
                    : selectedPublicGroup?.metric === "streak"
                    ? "Maior Streak"
                    : "Personalizado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Termina em:</strong>{" "}
                  {selectedPublicGroup?.end_date &&
                    new Date(selectedPublicGroup.end_date).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button
                onClick={joinGroup}
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
              >
                Confirmar Entrada
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
