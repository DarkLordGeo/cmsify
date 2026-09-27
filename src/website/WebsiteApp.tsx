import { Home } from './Home';
import { Layout } from './Layout';
import { useHashPath } from './router';

export const routes = [{ path: '/', label: 'Home', component: Home }];

/** The website on its own. It runs without CMSify and shows the defaults from its code. */
export function WebsiteApp() {
  const path = useHashPath();
  const Page = (routes.find((route) => route.path === path) ?? routes[0]).component;
  return (
    <Layout>
      <Page />
    </Layout>
  );
}
