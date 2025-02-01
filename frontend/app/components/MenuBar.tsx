import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider
} from "@heroui/react";
import PDFInput from "./PDFInput";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../routes/api.form-handler";

export default function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ 네비바 (항상 표시) */}
      <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent justify="start">
          <NavbarMenuToggle className="xl:hidden" aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent>

        <NavbarContent justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit">Summary AI</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="warning" href="#" variant="flat">
              Logout
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* 모바일에서는 토글 메뉴 사용 */}
        <NavbarMenu>
          <NavbarMenuItem>
            <Card className="w-full max-w-xl p-6 shadow-lg bg-white rounded-lg border border-gray-200">
              <CardHeader className="text-xl font-bold text-center"> Generate New Summary</CardHeader>
              <Divider />
              <CardBody>
                <PDFInput onSubmit={(e) => handleSubmit(e, navigate)} />
              </CardBody>
            </Card>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      {/* ✅ xl 이상에서는 왼쪽에 사이드바 고정 */}
      <div className="hidden xl:block md:w-1/5 md:h-screen md:fixed md:left-0 md:top-[4rem] md:shadow-lg md:p-6">
          <div className="text-lg mb-3 font-bold text-center"> Generate New Summary</div>
          <Divider />
          <div className="p-5">
              <PDFInput onSubmit={(e) => handleSubmit(e, navigate)} />
          </div>    
      </div>
    </>
  );
}
