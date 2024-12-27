import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function CustomToastNotification( {closeToast, title, content} ) {
  return (
    <div className="flex flex-col w-full">
      <h3 className="text-zinc-800 text-sm font-semibold flex items-center gap-1 ms-3">
        <FontAwesomeIcon icon={"fa-solid fa-box-archive"}/> {title}
      </h3>

      <div className="pl-5 mt-2">
        <p className="text-sm">{content}</p>

        {/* <div className="flex items-center gap-2">
          <button
            onClick={closeToast}
            className="transition-all border-none text-sm font-semibold bg-transparent border rounded-md py-2 text-indigo-600 active:scale-[.95]"
          >
            Undo
          </button>
          <button
            onClick={closeToast}
            className="transition-all border-none text-sm bg-transparent border font-semibold rounded-md py-2 text-grey-400 active:scale-[.95]"
          >
            Dismiss
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default CustomToastNotification;
