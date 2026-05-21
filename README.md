# front-mobile — Guia rápido (Expo)

Este README contém instruções objetivas para iniciar o aplicativo mobile localizado em `front-mobile/`.

## Pré-requisitos
- Node.js 18+ (recomenda-se 20)
- npm (ou pnpm/yarn)
- Expo CLI (opcional global): `npm install -g expo-cli`
- Expo Go (celular) ou emulador configurado

## 1 — Instalar dependências
Abra um terminal e rode:
```bash
cd front-mobile
npm install
```

## 2 — Ajustar URL da API
O app faz requisições para a API definida em [front-mobile/constants/api.ts](front-mobile/constants/api.ts). Altere `API_BASE_URL` conforme o seu backend:

- Backend local no computador (emulador Android): `http://10.0.2.2:3000`
- Backend local em dispositivo físico: `http://<SEU_IP_LOCAL>:3000` (ex: `http://192.168.0.10:3000`)
- Backend remoto / Supabase: `https://meu-backend.example.com`

Após editar, reinicie o Metro se estiver rodando.

## 3 — Executar em desenvolvimento
```bash
cd front-mobile
npm start
# ou
npx expo start
```

Isto abrirá o Expo DevTools com QR code. Opções de execução:
- Expo Go (dispositivo físico) — escaneie o QR
- Android emulator / iOS simulator (se configurados)

Para rodar direto em emulador (se configurado):
```bash
npm run android
# ou
npm run ios
```

## 4 — Permissões de câmera (QR)
A tela de QR solicita permissão de câmera na primeira execução. Se a permissão não aparecer:
- No Android verifique `app.json`/`app.config` (permissions)
- No iOS, certifique-se de testar em dispositivo ou emulador compatível

## 5 — Limpar storage / tokens
Se os tokens do `AsyncStorage` estiverem inconsistentes (401), limpe dados do app via DevTools ou reinstale o app.

## 6 — Testes rápidos
- Login: `(auth)/login`
- Registrar: `(auth)/register` (cria usuário e auto-login)
- Ler QR: `(cliente)/qr` (pode usar o bloco manual para token)
- Conectar mesa: `(cliente)/mesa-conexao` → redireciona para `mesa-resumo`

## 7 — Dicas e troubleshooting
- Erro `Network request failed`: verifique `API_BASE_URL`, firewall e se o dispositivo está na mesma rede.
- Expo DevTools travando: reinicie com `npm start -c` (limpa cache).
- Emulador Android sem internet: verifique o `adb` e a configuração de rede do emulador.

## 8 — Scripts úteis (no `front-mobile`)
- `npm start` — abre Metro/Expo DevTools
- `npm run android` — inicia em emulador Android (se configurado)
- `npm run ios` — inicia emulador iOS (macOS)

---

Se quiser, posso:
- adicionar um `env.example` no `front-mobile` para centralizar `API_BASE_URL`,
- ou atualizar `package.json` com scripts `start:local` que definem `API_BASE_URL` automaticamente.
Diga qual prefere.
