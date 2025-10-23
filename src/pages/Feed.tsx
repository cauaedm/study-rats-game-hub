import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MobileNav } from "@/components/MobileNav";

interface Post {
  id: string;
  photo_url: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
  study_sessions: {
    duration_minutes: number;
  } | null;
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar_url: string | null }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('study_posts')
        .select(`
          *,
          study_sessions (duration_minutes)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Load profiles separately
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      const profilesMap: Record<string, { name: string; avatar_url: string | null }> = {};
      profilesData?.forEach(profile => {
        profilesMap[profile.id] = {
          name: profile.name,
          avatar_url: profile.avatar_url
        };
      });

      setProfiles(profilesMap);
      setPosts(postsData || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <MobileNav />
      <div className="pb-20 pt-14 px-4 max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4">Feed de Estudos</h1>
      
      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma sessão de estudo registrada ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Complete uma sessão de estudo para ver posts aqui!
          </p>
        </Card>
      ) : (
        posts.map((post) => {
          const profile = profiles[post.user_id] || { name: "Usuário", avatar_url: null };
          return (
          <Card key={post.id} className="overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
              {post.study_sessions?.duration_minutes && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{post.study_sessions.duration_minutes}min</span>
                </div>
              )}
            </div>

            {/* Photo */}
            <img 
              src={post.photo_url} 
              alt={post.title}
              className="w-full aspect-square object-cover"
            />

            {/* Content */}
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              {post.description && (
                <p className="text-muted-foreground">{post.description}</p>
              )}
            </div>
          </Card>
        );
        })
      )}
    </div>
    </>
  );
}
