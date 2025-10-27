# 📱 Guia de Build Mobile - StudyRats

## ✅ Configuração Completa

O projeto já está configurado com Capacitor! Agora você pode fazer build para iOS e Android.

## 🚀 Próximos Passos para Build Local

### 1️⃣ Exportar e Clonar o Projeto

```bash
# No Lovable, clique em "Export to Github"
# Depois clone localmente:
git clone [seu-repositório]
cd study-rats-game-hub
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

### 3️⃣ Adicionar Plataformas

```bash
# Para iOS (requer Mac + Xcode)
npx cap add ios

# Para Android (requer Android Studio)
npx cap add android
```

### 4️⃣ Build do Projeto

```bash
npm run build
```

### 5️⃣ Sincronizar com Capacitor

```bash
npx cap sync
```

### 6️⃣ Abrir no IDE Nativo

```bash
# Para iOS (abre no Xcode)
npx cap open ios

# Para Android (abre no Android Studio)
npx cap open android
```

## 📝 Desenvolvimento com Hot Reload

Durante o desenvolvimento, o app está configurado para conectar ao servidor do Lovable:
- URL: `https://482d9e8b-0721-4402-90c9-f1986bfb5d18.lovableproject.com`
- Isso permite ver mudanças em tempo real no emulador

**Para produção**, você precisa:
1. Comentar ou remover a seção `server` no `capacitor.config.ts`
2. Fazer build: `npm run build`
3. Sincronizar: `npx cap sync`

## 🎨 Recursos Nativos Implementados

- ✅ **Câmera Nativa**: Usa API nativa do Capacitor
- ✅ **Status Bar**: Personalizada com cor do app (#499BD1)
- ✅ **Splash Screen**: Tela de carregamento com logo
- ✅ **Meta Tags Mobile**: Otimizado para iOS e Android

## 📱 Requisitos

### Para iOS:
- Mac com macOS
- Xcode instalado (via App Store)
- Apple Developer Account (para publicar)

### Para Android:
- Android Studio instalado
- JDK 11 ou superior
- Google Play Console Account (para publicar)

## 🏪 Publicação nas Lojas

### App Store (iOS):

1. Abra o projeto no Xcode:
   ```bash
   npx cap open ios
   ```

2. Configure:
   - Bundle Identifier
   - Versão e Build Number
   - Ícones e Splash Screens
   - Certificados de desenvolvimento/distribuição

3. Archive e Upload:
   - Product → Archive
   - Distribute App → App Store Connect
   - Upload

4. No App Store Connect:
   - Preencha informações do app
   - Screenshots
   - Descrição
   - Submeta para revisão

### Google Play (Android):

1. Abra o projeto no Android Studio:
   ```bash
   npx cap open android
   ```

2. Configure:
   - Package Name
   - Version Code e Version Name
   - Ícones e Splash Screens

3. Gere Bundle Assinado:
   - Build → Generate Signed Bundle / APK
   - Crie keystore (guarde em local seguro!)
   - Selecione release
   - Gere o bundle

4. No Google Play Console:
   - Crie novo app
   - Upload do bundle
   - Preencha informações
   - Screenshots
   - Submeta para revisão

## 🔧 Scripts Úteis

Após clonar o projeto, você pode adicionar estes scripts ao `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "cap:sync": "cap sync",
    "cap:ios": "cap open ios",
    "cap:android": "cap open android",
    "build:mobile": "npm run build && cap sync",
    "build:ios": "npm run build && cap sync && cap open ios",
    "build:android": "npm run build && cap sync && cap open android"
  }
}
```

## 📸 Ícones e Splash Screens

O projeto usa `/logo.png` como ícone base. Para gerar todos os tamanhos:

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

Ou crie manualmente em:
- `ios/App/App/Assets.xcassets/`
- `android/app/src/main/res/`

## ⚡ Permissões Configuradas

### iOS (Info.plist):
- Câmera: "StudyRats precisa acessar a câmera para registrar suas sessões de estudo"
- Galeria de Fotos: "StudyRats precisa acessar suas fotos para fazer upload"

### Android (AndroidManifest.xml):
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

## 🐛 Troubleshooting

**Erro ao sincronizar:**
```bash
npx cap sync --force
```

**Limpar cache:**
```bash
rm -rf node_modules
rm -rf ios android
npm install
npx cap add ios
npx cap add android
npm run build
npx cap sync
```

**Ver logs do device:**
```bash
# iOS
npx cap run ios --livereload

# Android
npx cap run android --livereload
```

## 📚 Documentação

- [Capacitor](https://capacitorjs.com)
- [Capacitor Camera](https://capacitorjs.com/docs/apis/camera)
- [iOS Development](https://developer.apple.com)
- [Android Development](https://developer.android.com)

---

**Desenvolvido com ❤️ no Lovable**
