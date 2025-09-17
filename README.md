# 📱 CP4 Mobile - Task Manager

Um aplicativo móvel moderno de gerenciamento de tarefas desenvolvido com React Native e Expo, integrado ao Firebase para autenticação e armazenamento de dados em tempo real.

## 🎥 Demonstração

📺 **Vídeo de Demonstração**: https://youtube.com/shorts/xwHjLvyDtVg?si=7xBj30g0g6EiZeUU

## 👥 Integrantes do Projeto

- **Arthur Chacon Garcia Spedine** - RM 554489
- **Matheus Esteves Marques da Silva** - RM 554769  
- **Gabriel Martins Falanga** - RM 555061

## ✨ Funcionalidades

### 🔐 Autenticação
- Login e cadastro com Firebase Authentication
- Autenticação por email e senha
- Alteração de senha
- Logout seguro

### 📋 Gerenciamento de Tarefas
- ✅ Criar, editar e excluir tarefas
- 📅 Definir data e horário de vencimento
- ✔️ Marcar tarefas como concluídas
- 🔄 Sincronização em tempo real
- 🗂️ Filtros por status (pendentes/concluídas)
- 📊 Dashboard com estatísticas

### 🎨 Interface e Experiência
- 🌓 Modo claro e escuro
- 🌍 Suporte a múltiplos idiomas (PT/EN)
- 📱 Design responsivo e moderno
- 🔔 Notificações push
- ♿ Acessibilidade aprimorada

### 🏠 Dashboard
- 📈 Estatísticas de tarefas
- 📰 Citações motivacionais diárias
- 🚨 Alertas de tarefas em atraso
- 🔄 Refresh pull-to-refresh

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** `^0.81.4` - Framework para desenvolvimento mobile
- **Expo** `^54.0.8` - Plataforma de desenvolvimento
- **TypeScript** `^5.9.2` - Linguagem tipada
- **Expo Router** `^6.0.6` - Navegação baseada em arquivos

### Backend e Database
- **Firebase** `^12.1.0` - Backend as a Service
  - Authentication (autenticação)
  - Firestore (banco de dados NoSQL)
  - Cloud Functions (funções serverless)

### State Management e Data Fetching
- **TanStack Query** `^5.87.4` - Gerenciamento de estado do servidor
- **AsyncStorage** `^2.2.0` - Armazenamento local

### UI/UX
- **React Native Safe Area Context** `^5.6.0` - Gerenciamento de safe areas
- **DateTimePicker** `^8.4.4` - Seletor de data e hora
- **Expo Notifications** `^0.32.11` - Sistema de notificações

### Internacionalização
- **i18next** `^25.5.0` - Framework de internacionalização
- **react-i18next** `^15.7.3` - Integração com React
- **react-native-localize** `^3.5.2` - Detecção de localização

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)
- Dispositivo físico ou emulador

### 1️⃣ Clonando o Repositório
```bash
git clone https://github.com/arthurspedine/cp4-mobile.git
cd cp4-mobile
```

### 2️⃣ Instalando Dependências
```bash
npm install
# ou
yarn install
```

### 3️⃣ Configurando o Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicione um app Android/iOS
3. Baixe o arquivo de configuração
4. Configure as credenciais em `src/services/firebaseConfig.tsx`

### 4️⃣ Executando o Projeto

#### Modo Desenvolvimento
```bash
npm start
# ou
npx expo start
```

#### Para dispositivos específicos
```bash
# Android
npm run android
# ou
npx expo start --android

# iOS
npm run ios
# ou
npx expo start --ios

# Web
npm run web
# ou
npx expo start --web
```

### 5️⃣ Testando no Dispositivo
1. Instale o app **Expo Go** no seu dispositivo
2. Escaneie o QR code que aparece no terminal
3. O app será carregado automaticamente

## 📁 Estrutura do Projeto

```
cp4-mobile/
├── app/                          # Páginas principais (Expo Router)
│   ├── index.tsx                 # Página de login
│   ├── _layout.tsx               # Layout principal
│   ├── HomeScreen.tsx            # Dashboard principal
│   ├── TaskScreen.tsx            # Gerenciamento de tarefas
│   ├── CadastrarScreen.tsx       # Cadastro de usuário
│   └── AlterarSenhaScreen.tsx    # Alteração de senha
├── src/
│   ├── components/               # Componentes reutilizáveis
│   │   ├── TaskItem.tsx          # Item de tarefa
│   │   ├── ThemeToggleButton.tsx # Botão de tema
│   │   └── ItemLoja.tsx          # Componente de exemplo
│   ├── context/                  # Contextos do React
│   │   ├── AuthContext.tsx       # Contexto de autenticação
│   │   ├── TaskContext.tsx       # Contexto de tarefas
│   │   └── ThemeContext.tsx      # Contexto de tema
│   ├── services/                 # Serviços e APIs
│   │   ├── firebaseConfig.tsx    # Configuração do Firebase
│   │   ├── taskService.ts        # Serviço de tarefas
│   │   ├── notifications.ts      # Serviço de notificações
│   │   └── i18n.ts              # Configuração de idiomas
│   ├── types/                    # Definições de tipos
│   │   └── task.ts              # Tipos relacionados a tarefas
│   └── locales/                  # Arquivos de tradução
│       ├── pt.json              # Português
│       └── en.json              # Inglês
├── assets/                       # Recursos estáticos
│   ├── icon.png                 # Ícone do app
│   ├── splash-icon.png          # Splash screen
│   └── ...                      # Outros assets
├── app.json                     # Configuração do Expo
├── package.json                 # Dependências do projeto
└── tsconfig.json               # Configuração do TypeScript
```

## 🔥 Funcionalidades Implementadas

### ✅ Autenticação e Usuário
- [x] Login com email/senha
- [x] Cadastro de novos usuários
- [x] Alteração de senha
- [x] Logout
- [x] Persistência de sessão

### ✅ Tarefas
- [x] CRUD completo de tarefas
- [x] Data e hora de vencimento
- [x] Status de conclusão
- [x] Sincronização em tempo real
- [x] Filtros e busca
- [x] Estatísticas detalhadas

### ✅ Interface
- [x] Design system consistente
- [x] Modo claro/escuro
- [x] Responsividade
- [x] Animações suaves
- [x] Feedback visual

### ✅ Experiência do Usuário
- [x] Internacionalização (PT/EN)
- [x] Notificações push
- [x] Estados de loading
- [x] Tratamento de erros
- [x] Validações de formulário

## 📱 Screenshots

_Screenshots serão adicionados aqui_

## 🔧 Configurações Avançadas

### Firebase Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Configuração de Notificações
O app solicita permissões de notificação e agenda lembretes para tarefas com data de vencimento.

## 🐛 Solução de Problemas

### Erro de Build Android
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Erro de Metro Bundler
```bash
npx expo start --clear
```

### Problemas com Firebase
Verifique se as configurações em `firebaseConfig.tsx` estão corretas e se o projeto Firebase está ativo.
