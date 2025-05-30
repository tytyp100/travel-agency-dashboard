export interface User {
  name: string;
  email: string;
  imageUrl: string | null;
  joinedAt: string;
  accountId: string;
}

export namespace Route {
  export interface LoaderData {
    user: User | null;
  }

  export interface ComponentProps {
    loaderData: LoaderData;
  }
} 