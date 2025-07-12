import Link from "next/link";

interface ChatHeaderProps {
  waId: string;
  messageCount?: number;
  onBack?: () => void;
}

export function ChatHeader({ waId, messageCount = 0, onBack }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-medium text-sm">
                {waId.slice(-2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{waId}</h1>
              <p className="text-sm text-gray-500">
                {messageCount} {messageCount === 1 ? 'mensaje' : 'mensajes'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-500">En línea</span>
        </div>
      </div>
    </div>
  );
}