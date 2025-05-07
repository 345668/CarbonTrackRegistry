import { Route, RouteComponentProps } from "wouter";
import { PageTransition } from "./page-transition";

interface AnimatedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function AnimatedRoute({ path, component: Component }: AnimatedRouteProps) {
  return (
    <Route path={path}>
      {(params) => (
        <PageTransition>
          <Component {...params} />
        </PageTransition>
      )}
    </Route>
  );
}