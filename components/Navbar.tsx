import { FC } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

interface NavbarProps {
  mode: "search" | "chat";
  setMode: (mode: "search" | "chat") => void;
}
export const Navbar: FC<NavbarProps> = ({ mode, setMode }) => {
  const name = process.env.NEXT_PUBLIC_NAME;
  const url = process.env.NEXT_PUBLIC_URL;
  const urlName = process.env.NEXT_PUBLIC_URL_NAME;
  const navbarColor = process.env.NEXT_PUBLIC_NAVBAR_COLOR;
  return (
    <div
      className={`flex h-[60px] border-b border-gray-300 py-2 px-8 items-center justify-between navbarColor`}
    >
      <div className='font-bold text-2xl flex items-center cursor-default'>
        <Link className='hover:opacity-50 navLogo' href='/'>
          {name}AI
        </Link>
      </div>
      <div className='flex items-center'>
        <div
          className={`${
            mode === "chat"
              ? "navSelectedColor drop-shadow-md"
              : "bg-transparent text-gray-500 hover:scale-105 "
          } font-bold text-2xl rounded-md py-2 px-4 mr-2 hover:cursor-pointer `}
          onClick={() => setMode("chat")}
        >
          Dialogue
        </div>
        <div
          className={`${
            mode === "search"
              ? "navSelectedColor drop-shadow-md "
              : "bg-transparent text-gray-500  hover:scale-105"
          }   font-bold text-2xl rounded-md py-2 px-4   hover:cursor-pointer`}
          onClick={() => setMode("search")}
        >
          Ask
        </div>
      </div>
      <div>
        <a
          className='flex items-center hover:opacity-50'
          href={url}
          target='_blank'
          rel='noreferrer'
        >
          <div className='hidden sm:flex'>{urlName}</div>
          <IconExternalLink className='ml-1 hidden sm:flex' size={20} />
        </a>
      </div>
    </div>
  );
};
