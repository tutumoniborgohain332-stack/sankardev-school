// Vercel serverless entry point
// The build command pre-builds the api-server, we re-export it here
export { default } from "../artifacts/api-server/dist/index.mjs";
