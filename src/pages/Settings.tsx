import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { MobileNav } from "@/components/MobileNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado");
    navigate("/auth");
  };

  return (
    <>
      <MobileNav />
      <div className="min-h-screen pt-14 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <header className="animate-fade-in">
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
          </header>

        <Card className="p-6 shadow-card animate-scale-in">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Aparência</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <Label htmlFor="dark-mode" className="text-base font-medium">
                      Modo Noturno
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para reduzir o brilho da tela
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Conta</h2>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
