import {
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  Question,
  Lightbulb,
  File,
  Megaphone,
  BookOpen,
  ArrowSquareOut,
} from "@phosphor-icons/react";

function HelpModal() {
  const openInNewTab = (path) => {
    window.open(path, "_blank");
  };

  return (
    <Menu placement="bottom-start" dismiss={{ itemPress: false }}>
      <MenuHandler>
        <Button variant="text" className="flex items-center px-3 py-3 gap-x-3">
          <Question size={24} className="cursor-pointer" />
        </Button>
      </MenuHandler>

      <MenuList className="z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-2 ring-black/5 border-none text-black">
        <div className="py-4 px-4 text-sm font-semibold">Help</div>
        <div className="py-1">
          <MenuItem
            onClick={() => openInNewTab("/help/about")}
            className="flex justify-between items-center px-4 py-2 text-xs hover:bg-blue-50"
          >
            <div className="flex gap-2 items-center">
              <Lightbulb size={18} />
              <p>What is Service Link?</p>
            </div>
            <ArrowSquareOut size={18} />
          </MenuItem>

          <MenuItem
            onClick={() => openInNewTab("/help/documentation")}
            className="flex justify-between items-center px-4 py-2 text-xs hover:bg-blue-50"
          >
            <div className="flex gap-2 items-center">
              <File size={18} />
              <p>Browse Complete Documentation</p>
            </div>
            <ArrowSquareOut size={18} />
          </MenuItem>

          <MenuItem
            onClick={() => openInNewTab("/help/feedback")}
            className="flex justify-between items-center px-4 py-2 text-xs hover:bg-blue-50"
          >
            <div className="flex gap-2 items-center">
              <Megaphone size={18} />
              <p>Submit Feedback About the ServiceLink</p>
            </div>
            <ArrowSquareOut size={18} />
          </MenuItem>

          <MenuItem
            onClick={() => openInNewTab("/help/how-to")}
            className="flex justify-between items-center px-4 py-2 text-xs hover:bg-blue-50"
          >
            <div className="flex gap-2 items-center">
              <BookOpen size={18} />
              <p>How to use the System?</p>
            </div>
            <ArrowSquareOut size={18} />
          </MenuItem>
        </div>
      </MenuList>
    </Menu>
  );
}

export default HelpModal;
