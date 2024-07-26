import { useRouter } from "next/router";
import KanbanBoardTest from "~/components/kanban/board";

export default function Board() {
  const router = useRouter();
  const { boardId } = router.query;

  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex h-full flex-grow flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="mx-4 flex max-w-screen-2xl flex-col gap-6">
          {children}
        </div>
      </div>
    );
  };

  if (!router.isReady)
    return (
      <Layout>
        <div className="text-white">Loading...</div>
      </Layout>
    );
  if (boardId === undefined)
    return (
      <Layout>
        <div className="text-red-500">Error: Board ID is undefined</div>
      </Layout>
    );

  return (
    <div className="flex h-full flex-grow flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="mx-4 flex max-w-screen-2xl flex-col gap-6">
        <KanbanBoardTest boardId={boardId as string} />
      </div>
    </div>
  );
}
