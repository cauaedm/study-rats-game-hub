import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary min-h-screen flex items-center justify-center p-4">
        <div className="max-w-5xl mx-auto text-center text-white animate-fade-in">
          <img 
            src={logo} 
            alt="Study Rats Logo" 
            className="w-48 h-48 mx-auto mb-8 animate-scale-in"
          />
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            StudyRats
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Estude com foco, compete com amigos e alcance seus objetivos
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 transition-colors text-lg px-8"
            >
              Começar Agora
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 text-lg px-8"
            >
              Saber Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Recursos que Fazem a Diferença
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Clock}
              title="Cronômetro Inteligente"
              description="Acompanhe suas horas de estudo com precisão e visualize seu progresso"
            />
            <FeatureCard
              icon={Zap}
              title="Modo Foco"
              description="Bloqueie distrações e mantenha-se concentrado nos estudos"
            />
            <FeatureCard
              icon={Users}
              title="Grupos de Estudo"
              description="Crie competições com amigos e motivem-se mutuamente"
            />
            <FeatureCard
              icon={Trophy}
              title="Rankings e Streak"
              description="Acompanhe suas conquistas e mantenha seu streak ativo"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 gradient-accent">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Transformar Seus Estudos?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a milhares de estudantes que já melhoraram seu desempenho
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-accent hover:bg-white/90 transition-colors text-lg px-8"
          >
            Criar Conta Grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2025 StudyRats. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="text-center p-6 rounded-xl hover:shadow-card transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
