# Segurança do Código

- Nunca usar `dangerouslySetInnerHTML`, `eval()` ou `new Function()` em nenhuma parte do app.
- Todo texto vindo de input do usuário (descrição, título, nome de exercício, etc) deve ser renderizado como texto puro via JSX, nunca como HTML interpretado.
