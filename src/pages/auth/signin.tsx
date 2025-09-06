//src/pages/auth/signin.tsx
import { getProviders, signIn, ClientSafeProvider } from "next-auth/react";
import { GetServerSideProps } from "next";

export default function SignIn({
  providers,
}: {
  providers: Record<string, ClientSafeProvider> | null;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 rounded shadow-md w-[420px] bg-white">
        <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name} className="mb-4">
              <button
                onClick={() => signIn(provider.id)}
                className="w-full py-2 rounded bg-gray-800 text-white"
              >
                Iniciar sesión con {provider.name}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return { props: { providers } };
};
