import React from "react";

const Dropdown = ({ list, addItem, selectedItems, ele, flag }) => {
  return (
    <div
      id="dropdown"
      className={` bg-white z-40 w-full lef-0 rounded ${
        false ? "h-[500px] overflow-y-scroll" : "max-h-select"
      }  `}
    >
      <div className="flex flex-col w-full">
        {list &&
          list.map((item, key) => {
            if (flag) {
              if (selectedItems.yard?.includes(`${ele}:${item}`)) {
                return <span key={key}></span>;
              } else {
                return (
                  <div
                    key={key}
                    className="cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100"
                    onClick={() => addItem(item)}
                  >
                    <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                      <div className="w-full items-center flex">
                        <div className="mx-2 leading-6  ">{item}</div>
                      </div>
                    </div>
                  </div>
                );
              }
            } else {
              if (selectedItems.station?.includes(`${ele}:${item}`)) {
                return <></>;
              } else {
                return (
                  <div
                    key={key}
                    className="cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100"
                    onClick={() => addItem(item)}
                  >
                    <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                      <div className="w-full items-center flex">
                        <div className="mx-2 leading-6  ">{item}</div>
                      </div>
                    </div>
                  </div>
                );
              }
            }
          })}
      </div>
    </div>
  );
};

export default Dropdown;
