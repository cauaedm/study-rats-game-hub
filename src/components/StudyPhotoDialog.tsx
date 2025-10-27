import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera as CameraIcon, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface StudyPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  durationMinutes: number;
  onComplete: () => void;
}

export const StudyPhotoDialog = ({ open, onOpenChange, sessionId, durationMinutes, onComplete }: StudyPhotoDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNativeCamera = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setPhotoPreview(image.dataUrl);
        // Convert dataUrl to File object
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "study-photo.jpg", { type: "image/jpeg" });
        setPhoto(file);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Erro ao tirar foto");
    }
  };

  const handlePhotoAction = () => {
    if (Capacitor.isNativePlatform()) {
      handleNativeCamera();
    } else {
      // Trigger file input for web
      document.getElementById('photo-input')?.click();
    }
  };

  const handleSubmit = async () => {
    if (!photo || !title.trim()) {
      toast.error("Por favor, adicione uma foto e um título");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Upload photo to storage
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('study-photos')
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('study-photos')
        .getPublicUrl(fileName);

      // Create post
      const { error: postError } = await supabase
        .from('study_posts')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          photo_url: publicUrl,
          title: title.trim(),
          description: description.trim() || null,
        });

      if (postError) throw postError;

      toast.success(`Sessão registrada! ${durationMinutes} minutos estudados`);
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registre sua sessão de estudo</DialogTitle>
          <DialogDescription>
            Adicione uma foto para confirmar sua sessão de {durationMinutes} minutos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Foto *</Label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                >
                  Trocar
                </Button>
              </div>
            ) : (
              <div>
                <div 
                  onClick={handlePhotoAction} 
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CameraIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">
                        {Capacitor.isNativePlatform() ? 'Toque para tirar foto' : 'Clique para adicionar'}
                      </span>
                      {!Capacitor.isNativePlatform() && ' ou tire uma foto'}
                    </p>
                  </div>
                </div>
                {!Capacitor.isNativePlatform() && (
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Estudando React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="O que você estudou nesta sessão?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!photo || !title.trim() || uploading}
            className="w-full gradient-primary"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Enviando..." : "Registrar Sessão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
