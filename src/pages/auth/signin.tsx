import { getProviders, signIn, ClientSafeProvider } from "next-auth/react";
import { GetServerSideProps } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignIn({
  providers,
}: {
  providers: Record<string, ClientSafeProvider> | null;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Iniciar sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers &&
            Object.values(providers).map((provider) => (
              <div key={provider.name}>
                <Button
                  onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                  className="w-full"
                >
                  Iniciar sesión con {provider.name}
                </Button>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return { props: { providers } };
};
