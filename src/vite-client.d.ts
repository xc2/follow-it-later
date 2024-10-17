///<reference types="vite/client" />
///<reference types="@crxjs/vite-plugin/client" />

declare namespace chrome {
  namespace runtime {
    const dynamicId: string | undefined;
  }
}
