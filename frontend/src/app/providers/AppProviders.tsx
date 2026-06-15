import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router-v6";
import {
  dataProvider,
  authProvider,
  notificationProvider,
} from "@/shared/api";
import { i18nProvider } from "@/shared/i18n";
import { resources } from "@/app/config";
import { Toaster } from "@/shared/ui";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider}
        authProvider={authProvider}
        routerProvider={routerProvider}
        notificationProvider={notificationProvider}
        i18nProvider={i18nProvider}
        resources={resources}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          disableTelemetry: true,
        }}
      >
        {children}
        <Toaster />
      </Refine>
    </BrowserRouter>
  );
}
