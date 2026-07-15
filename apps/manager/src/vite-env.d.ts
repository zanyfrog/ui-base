interface ImportMetaEnv {
  readonly VITE_ORM_BASE_URL?: string;
  readonly VITE_IAM_BASE_URL?: string;
  readonly VITE_DEV_ACTOR_ID?: string;
  readonly VITE_DEV_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
