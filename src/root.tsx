// @refresh reload
import { Suspense } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";
import { StackDraggingProvider } from "./context/StackDraggingContext";
import { BinderStateProvider } from "./context/BinderStateContext";
import { StackStateProvider } from "./context/StackStateContext";
import { StackMapProvider } from "./context/StackMapContext";
import { CardListProvider } from "./context/CardListContext";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Sylvan Archive</Title>
        <Meta charset="utf-8" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/logos/sylvanArchiveBrowserIcon.svg"
        />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Font Imports */}
        {/* Satisfy */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Satisfy&display=swap"
          rel="stylesheet"
        />
        {/* Roboto */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <StackDraggingProvider dragState={"still"}>
              <BinderStateProvider binderStateList={0}>
                <StackStateProvider stackStateList={null}>
                  <StackMapProvider stackMapState={null}>
                    <CardListProvider cardListState={null}>
                      <Routes>
                        <FileRoutes />
                      </Routes>
                    </CardListProvider>
                  </StackMapProvider>
                </StackStateProvider>
              </BinderStateProvider>
            </StackDraggingProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
