import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import { FaChartBar } from "react-icons/fa";
import { FaCar } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdLocalParking } from "react-icons/md";
import { SidebarContext } from "./SidebarContext";

const sidebarItems = [
  {
    name: "Análises",
    href: "/",
    icon: FaChartBar,
  },
  {
    name: "Estacionamento",
    href: "/Estacionamento",
    icon: MdLocalParking,
  },
  {
    name: "Veículos",
    href: "/Veiculos",
    icon: FaCar,
  }
];

export default function Sidebar() {
  const { isCollapsedSidebar, toogleSidebarCollapseHandler } = useContext(SidebarContext);
  const [activeLink, setActiveLink] = useState("");

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
  };

  return (
    <div className="sidebar__wrapper">
      {isCollapsedSidebar ? (
        <button className="btn__open" onClick={toogleSidebarCollapseHandler}>
          <IoIosArrowForward />
        </button>
      ) : (
        <button className="btn__close" onClick={toogleSidebarCollapseHandler}>
          <IoIosArrowBack />
        </button>
      )}
      <aside className="sidebar" data-collapse={isCollapsedSidebar}>
        <div className="sidebar__top">
          <Image
            src="/imgLogoParkMe.png"
            width={35}
            height={25}
            className="sidebar__logo"
            alt="logo" 
          />
          <p className="sidebar__title">Park<strong>.Me</strong></p>
        </div>
        <ul className="sidebar__list">
          {sidebarItems.map(({ name, href, icon: Icon }) => (
            <li className="sidebar__item" key={name}>
              <Link 
                href={href} 
                className={`sidebar__link ${activeLink === href ? 'active' : ''}`} 
                onClick={() => handleLinkClick(href)} 
                scroll={false} 
              >
                <span className="sidebar_icon">
                  <Icon className={activeLink === href ? 'active-icon' : ''} />
                </span>
                <span className="sidebar__name">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}