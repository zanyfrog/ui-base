import '@ui-base/ui/styles.css';
import '@ui-base/calendar';
import '@ui-base/hero';
import '@ui-base/app-manager-design-tokens/tokens.css';
import '@ui-base/app-manager-ui/styles.css';
import '@ui-base/app-manager-ui';
import './styles.css';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Missing #app root element.');
}

root.innerHTML = `
  <uib-application-manager
    orm-base-url="${import.meta.env.VITE_ORM_BASE_URL ?? 'http://localhost:4020'}"
    iam-base-url="${import.meta.env.VITE_IAM_BASE_URL ?? 'http://localhost:4010'}"
    dev-actor-id="${import.meta.env.VITE_DEV_ACTOR_ID ?? 'original-creator'}"
    dev-token="${import.meta.env.VITE_DEV_TOKEN ?? 'dev-token'}"
  ></uib-application-manager>
`;
