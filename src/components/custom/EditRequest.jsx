"use client";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import {
  getStagingFormData,
  getStagingFormDataByRequestId,
  postStagingFormData,
  updateStagingFormData,
} from "../../app/actions/stagingform";
import { getUserId } from "../../app/actions/user";
import { sectionData, machine, work, data, workData } from "../../lib/store";
import MultipleSelect from "./blockrequest/MultipleSelect";
import MultipleSelectOld from "./blockrequest/MultipleSelectOld";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import validateForm from "./blockrequest/formValidation";
import { yardData } from "../../lib/yard";

import { getFormDataByRequestId } from "../../app/actions/formdata";

export default function EditRequest(props) {
  const maxDate = "2030-12-31";
  const router = useRouter();
  const { toast } = useToast();
  const [otherData, setOtherData] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    selectedDepartment: "",
    selectedSection: "",
    stationID: "",
    workType: "",
    workDescription: "",
    selectedLine: {
      station: [],
      yard: [],
    },
    selectedStream: "",
    missionBlock: "",
    cautionRequired: "",
    cautionSpeed: "",
    cautionLocationFrom: "",
    cautionLocationTo: "",
    workLocationFrom: "",
    workLocationTo: "",
    demandTimeFrom: "",
    demandTimeTo: "",
    sigDisconnection: "",
    ohDisconnection: "",
    elementarySectionFrom: "",
    elementarySectionTo: "",
    sigElementarySectionFrom: "",
    sigElementarySectionTo: "",
    repercussions: "",
    otherLinesAffected: {
      station: [],
      yard: [],
    },
    requestremarks: "",
    selectedDepo: "",
  });

  const inputRefs = useRef([]);
  const dateref = useRef();
  const departmentRef = useRef();

  const handleKeyDown = (e, index) => {
    e.preventDefault();
    if (e.key === "ArrowRight") {
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        inputRefs.current[nextIndex].focus();
      }
      // departmentRef.current.focus();
    }
  };

  function removeAfterLastDash(input) {
    return input.includes("-") ? input.slice(0, input.lastIndexOf("-")) : input;
  }

  useEffect(() => {
    if (props.flag) {
      setFormData(props.request);
    } else {
      const res = removeAfterLastDash(props.request.requestId);
      const fxn = async () => {
        const data = await getStagingFormDataByRequestId(res);
        if (data.requestData.length == 0) {
          const oldRequestResult = await getFormDataByRequestId(res);
          setFormData(oldRequestResult.requestData[0]);
        } else {
          setFormData(data.requestData[0]);
        }
      };
      fxn();
    }
  }, [props.request.requestId]);

  useEffect(() => {
    const fxn = async () => {
      const UserData = await getUserId(props.user?.user);
      if (UserData == null || UserData == undefined || UserData.id == null) {
        return;
      } else {
        formData.selectedDepartment = UserData.department;
      }
    };
    fxn();
  }, [formData]);

  const formValidation = (value) => {
    let res = validateForm(value);
    if (
      res.date ||
      res.selectedDepartment ||
      res.stationID ||
      res.workType ||
      res.workDescription ||
      res.selectedLine ||
      res.missionBlock ||
      res.demandTimeFrom ||
      res.demandTimeTo ||
      res.selectedDepo ||
      (formData.selectedDepartment != "TRD" &&
        (res.sigDisconnection || res.ohDisconnection || res.cautionRequired))
    ) {
      return false;
    } else {
      return true;
    }
  };

  function revertCategoryFormat(formattedCategory) {
    if (formattedCategory === "Gear") {
      return formattedCategory;
    }
    return formattedCategory.split(" ").join("_");
  }

  const blockGenerator = () => {
    if (formData.stationID != "" && formData.selectedSection != "") {
      for (let section of data.sections) {
        if (formData.selectedSection == section.name) {
          let res = section.section_blocks.concat(section.station_blocks);
          return res;
        }
      }
      return [];
    } else {
      return [];
    }
  };

  const getTheListForYard = () => {
    const res = [];
    blockGenerator().map((element, inf) => {
      res.push(element.block);
    });
    return res;
  };

  const getMissionBlock = () => {
    if (formData.missionBlock === "") {
      return [];
    } else {
      const check = formData.missionBlock.split(",").map((name) => name.trim());
      return check;
    }
  };

  const getTheListFilter = (missionBlock) => {
    let result = [];
    const arr = missionBlock?.split("-").map((name) => name.trim());
    if (arr?.includes("YD")) {
      const found = formData.selectedLine.yard.find((item) =>
        item?.startsWith(`${missionBlock}:`)
      );
      const commondata = found ? found.split(":")[1] : null;
      yardData.stations.map((yard) => {
        if (yard.station_code === arr[0]) {
          // result = yard.roads;
          result = yard.roads.filter(
            (item) => item?.direction === formData.selectedStream
          );
          result = result.map((item) => item.road_no);
          const indexToFilterOut = result.findIndex(
            (item) => item === commondata
          );
          result = result.filter((_, index) => index !== indexToFilterOut);
        }
      });
    } else {
      const found = formData.selectedLine.station.find((item) =>
        item?.startsWith(`${missionBlock}:`)
      );
      const commondata = found ? found.split(":")[1] : null;
      blockGenerator().map((element, ind) => {
        if (element.block === missionBlock) {
          result = element.lines;
        }
        const indexToFilterOut = result.findIndex(
          (item) => item === commondata
        );
        result = result.filter((_, index) => index !== indexToFilterOut);
      });
    }

    return result;
  };

  const getTheList = (missionBlock) => {
    let result = [];
    const arr = missionBlock?.split("-").map((name) => name.trim());
    if (arr?.includes("YD")) {
      // const found = formData.selectedLine.yard.find((item) =>
      //   item?.startsWith(`${missionBlock}:`)
      // );
      // const commondata = found ? found.split(":")[1] : null;
      yardData.stations.map((yard) => {
        if (yard.station_code === arr[0]) {
          result = yard.roads;
          // result = yard.roads.map((item) => item.road_no);
        }
      });
    } else {
      const found = formData.selectedLine.station.find((item) =>
        item?.startsWith(`${missionBlock}:`)
      );
      const commondata = found ? found.split(":")[1] : null;
      blockGenerator().map((element, ind) => {
        if (element.block === missionBlock) {
          result = element.lines;
        }
      });
    }

    return result;
  };

  const getLineSectionValue = (ele, arr) => {
    if (arr?.includes("YD")) {
      const foundItem = formData.selectedLine.yard.find((item) =>
        item?.startsWith(`${ele}:`)
      );
      if (foundItem) {
        return foundItem;
      }
      return "";
    } else {
      const foundItem = formData.selectedLine.station.find((item) =>
        item?.startsWith(`${ele}:`)
      );
      if (foundItem) {
        return foundItem;
      }
      return "";
    }
  };

  const handleMoveToNext = (index) => (e) => {
    if (e.target.value.length > 0 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (
      formData.selectedDepartment === "ENGG" &&
      (name === "cautionLocationFrom" ||
        name === "cautionLocationTo" ||
        name === "elementarySectionFrom" ||
        name === "elementarySectionTo" ||
        name === "sigElementarySectionFrom" ||
        name === "sigElementarySectionTo")
    ) {
      let rawValue = value.replace(/\//g, "");

      if (rawValue.length <= 3) {
        setFormData({
          ...formData,
          [name]: rawValue,
        });
      } else if (rawValue.length > 3 && rawValue.length <= 5) {
        const formattedValue = rawValue.slice(0, 3) + "/" + rawValue.slice(3);
        setFormData({
          ...formData,
          [name]: formattedValue,
        });
      } else if (rawValue.length > 5) {
        toast({
          title: "Invalid Format",
          description: "Fill the section in the format xxx/yy",
          variant: "destructive",
        });
      }
    } else if (
      formData.selectedDepartment === "ENGG" &&
      (name === "workLocationFrom" || name === "workLocationTo")
    ) {
      let rawValue = value;

      rawValue = rawValue.replace(/[^0-9.]/g, "");

      const decimalIndex = rawValue.indexOf(".");

      if (decimalIndex !== -1) {
        const beforeDecimal = rawValue.slice(0, decimalIndex);
        const afterDecimal = rawValue.slice(decimalIndex + 1, decimalIndex + 4);
        rawValue = beforeDecimal + "." + afterDecimal;
      }

      setFormData({
        ...formData,
        [name]: rawValue,
      });
    } else if (name === "selectedDepartment") {
      formData.workType = "";
      formData.workDescription = "";
      setFormData({ ...formData, [name]: value });
    } else if (name === "selectedSection") {
      formData.stationID = "Section/Yard";
      formData.missionBlock = "";
      formData.otherLinesAffected = "";
      setFormData({ ...formData, [name]: value });
    } else if (name === "date") {
      if (value > maxDate) {
        event.target.value = maxDate; // Reset the input value to maxDate
        alert(`Date cannot be later than ${maxDate}`);
        return;
      }
      setFormData({ ...formData, [name]: value });
    } else if (name === "selectedLine") {
      if (value.includes("YD")) {
        const [newKey] = value.split(":");

        formData.selectedLine = {
          ...formData.selectedLine,
          yard: [
            ...formData.selectedLine.yard.filter(
              (item) => !item?.startsWith(`${newKey}:`)
            ),
            value,
          ],
        };
      } else {
        const [newKey] = value.split(":");
        formData.selectedLine = {
          ...formData.selectedLine,
          station: [
            ...formData.selectedLine.station.filter(
              (item) => !item?.startsWith(`${newKey}:`)
            ),
            ,
            value,
          ],
        };

        // setLineData((prevData) => ({
        //   ...prevData,
        //   station: [
        //     ...prevData.station.filter(
        //       (item) => !item.startsWith(`${newKey}:`)
        //     ),
        //     value,
        //   ],
        // }));
      }
      formData.selectedLine = {
        yard: [
          ...formData.selectedLine.yard.filter(
            (item) => item != null || item != undefined
          ),
        ],
        station: [
          ...formData.selectedLine.station.filter(
            (item) => item != null || item != undefined
          ),
        ],
      };
      setFormData({ ...formData, [name]: formData.selectedLine });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const formSubmitHandler = async () => {
    try {
      if (formValidation(formData) == true) {
        if (formData.workDescription === "others") {
          if (otherData === "") {
            toast({
              title: "Invalid Format",
              description: "Fill the section in the format xxx/yy",
              variant: "destructive",
            });
            return;
          }
          formData.workDescription = "Other Entry" + ":" + otherData;
        }
        const res = await updateStagingFormData(formData, formData.requestId);

        setFormData({
          date: "",
          selectedDepartment: "",
          selectedSection: "",
          stationID: "",
          workType: "",
          workDescription: "",
          selectedLine: {
            station: [],
            yard: [],
          },
          selectedStream: "",
          missionBlock: "",
          cautionRequired: "",
          cautionSpeed: "",
          cautionLocationFrom: "",
          cautionLocationTo: "",
          workLocationFrom: "",
          workLocationTo: "",
          demandTimeFrom: "",
          demandTimeTo: "",
          sigDisconnection: "",
          ohDisconnection: "",
          elementarySectionFrom: "",
          elementarySectionTo: "",
          sigElementarySectionFrom: "",
          sigElementarySectionTo: "",
          repercussions: "",
          otherLinesAffected: {
            station: [],
            yard: [],
          },
          requestremarks: "",
          selectedDepo: "",
        });
        toast({
          title: "Success",
          description: "Request Submitted",
        });
        props.setShowPopup((prev) => !prev);
      } else {
        toast({
          title: "Submission Failed",
          description: "Fill All The Details",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="custom-main-w mx-auto p-4 mt-10 bg-blue-100 rounded-lg shadow-lg">
      <h1 className="text-center text-xl font-bold mb-4">Request Form</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">
            Date <span style={{ color: "red" }}>*</span>
          </label>
          <input
            ref={(el) => (inputRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            value={formData.date}
            type="date"
            name="date"
            className="mt-1 w-full p-2 border rounded"
            onChange={handleChange}
            max={maxDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Department <span style={{ color: "red" }}>*</span>
          </label>
          <select
            ref={(el) => (inputRefs.current[1] = el)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            value={formData.selectedDepartment}
            name="selectedDepartment"
            className="mt-1 w-full p-2.5 border rounded"
            onChange={handleChange}
            disabled
          >
            <option value={""}>Select department </option>
            <option value={"ENGG"}>ENGG</option>
            <option value={"SIG"}>SIG</option>
            <option value={"TRD"}>TRD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">
            Section <span style={{ color: "red" }}>*</span>
          </label>
          <select
            ref={(el) => (inputRefs.current[2] = el)}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            value={formData.selectedSection}
            name="selectedSection"
            className="mt-1 w-full p-2.5 border rounded"
            onChange={handleChange}
          >
            <option>Select section</option>
            <option value={"AJJ-RU"}>AJJ-RU</option>
            <option value={"MAS-AJJ"}>MAS-AJJ</option>
            <option value={"MSB-VM"}>MSB-VM</option>
            <option value={"AJJ-KPD"}>AJJ-KPD</option>
            <option value={"KPD-JTJ"}>KPD-JTJ</option>
            <option value={"AJJ-CGL"}>AJJ-CGL</option>
            <option value={"MAS-GDR"}>MAS-GDR</option>
          </select>
        </div>
      </div>

      <div className="inline relative mb-4 ">
        <input
          ref={(el) => (inputRefs.current[3] = el)}
          onKeyDown={(e) => handleKeyDown(e, 3)}
          name="stationID"
          value={formData.stationID}
          className="mt-1 p-2 w-[535px] rounded-md"
          onChange={handleChange}
          placeholder="Select Block Section"
          // disabled={true}
          readOnly
        />
        {/* <option className="block text-sm font-medium " value={""}>
            Select Block Section
          </option>
          <option className="block text-sm font-medium " value={"Section/Yard"}>
            Section/Yard
          </option> */}
        {/* </select> */}

        <div className="absolute w-[538px] top-[-20px] left-[552px] mb-4">
          <MultipleSelect
            items={getTheListForYard()}
            value={formData.missionBlock}
            setFormData={setFormData}
            name="missionBlock"
            placeholder={true}
            limit={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
        <select
          ref={(el) => (inputRefs.current[5] = el)}
          onKeyDown={(e) => handleKeyDown(e, 5)}
          value={formData.workType}
          name="workType"
          className="mt-1 p-2 rounded-md"
          onChange={handleChange}
        >
          <option className="block text-sm font-medium " value={""}>
            Select The Work Description
          </option>

          {formData.selectedDepartment != "" &&
            Object.keys(workData[`${formData.selectedDepartment}`]).map(
              (element) => {
                const formattedCategory = element
                  .replace(/_/g, " ")
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ");
                return (
                  <option
                    className="block text-sm font-medium "
                    value={`${formattedCategory}`}
                    key={formattedCategory}
                  >
                    {formattedCategory}
                  </option>
                );
              }
            )}
        </select>
        {formData.workType != "" && formData.workType === "others" ? (
          <input
            type="text"
            name="workDescription"
            className="mt-1 w-full p-2.5 border rounded z-1000"
            onChange={handleChange}
            value={formData.workDescription}
          />
        ) : (
          <select
            ref={(el) => (inputRefs.current[6] = el)}
            onKeyDown={(e) => handleKeyDown(e, 6)}
            name="workDescription"
            className="mt-1 w-full p-2.5 border rounded z-1000"
            onChange={handleChange}
            value={formData.workDescription}
          >
            <option>Select work description </option>
            {formData.workType != "" &&
              workData[`${formData.selectedDepartment}`][
                `${revertCategoryFormat(formData.workType)}`
              ].map((e) => {
                return (
                  <option
                    className="block text-sm font-medium"
                    value={e}
                    key={e}
                  >
                    {e}
                  </option>
                );
              })}
            <option className="block text-sm font-medium " value={"others"}>
              Others
            </option>
          </select>
        )}
        {formData.workDescription === "others" && (
          <div className="ml-[555px] ">
            <input
              type="text"
              name="otherData"
              placeholder="Enter The Other Task Here"
              className="border border-slate-900 rounded-lg p-2 w-[400px]"
              value={otherData}
              onChange={(e) => {
                setOtherData(e.target.value);
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        {getMissionBlock().map((ele) => {
          const arr = ele?.split("-").map((name) => name.trim());
          const value = getLineSectionValue(ele, arr);

          return (
            <div>
              {ele.split("-")[1] === "YD" && (
                <div>
                  <label className="block text-sm font-medium">
                    Stream for {ele}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    name="selectedStream"
                    value={formData.selectedStream}
                    className="mt-1 w-full p-2 border rounded"
                    onChange={handleChange}
                  >
                    <option value={""}>Select Stream</option>
                    <option value={"Upstream"}>Up Stream</option>
                    <option value={"Downstream"}>Down Stream</option>
                    <option value={"Both"}>Both</option>
                  </select>
                </div>
              )}
              <label className="block mt-3 text-sm font-medium">
                {arr?.includes("YD") ? `Road ${ele}` : `Line ${ele}`}
                <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="selectedLine"
                ref={(el) => (inputRefs.current[5] = el)}
                onKeyDown={(e) => handleKeyDown(e, 5)}
                value={value}
                className="mt-1 w-full p-2 border rounded"
                onChange={handleChange}
              >
                <option value={""}>
                  Select {arr?.includes("YD") ? `Road ` : `Line `}
                </option>
                {getTheList(ele).map((e) => {
                  if (e.road_no) {
                    if (e.direction === formData.selectedStream) {
                      return (
                        <>
                          <option value={`${ele}:${e.road_no}`} key={e.road_no}>
                            {e.road_no}
                          </option>
                        </>
                      );
                    }
                  } else {
                    return (
                      <>
                        <option value={`${ele}:${e}`} key={e}>
                          {e}
                        </option>
                      </>
                    );
                  }
                })}
              </select>
            </div>
          );
        })}

        <div>
          {formData.selectedDepartment === "ENGG" && (
            <label className="block text-sm font-medium">
              Work location <span style={{ color: "red" }}>*</span>
            </label>
          )}
          {formData.selectedDepartment === "SIG" && (
            <label className="block text-sm font-medium">
              Route <span style={{ color: "red" }}>*</span>
            </label>
          )}
          {formData.selectedDepartment === "TRD" && (
            <label className="block text-sm font-medium">
              Elementry Section
            </label>
          )}
          {formData.selectedDepartment === "" ||
            (formData.selectedDepartment === "ENGG" && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.workLocationFrom}
                  name="workLocationFrom"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="from"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.workLocationTo}
                  name="workLocationTo"
                  className="mt-1 w-1/2 p-2 border rounded"
                  placeholder="to"
                  onChange={handleChange}
                />
              </div>
            ))}
          {formData.selectedDepartment === "SIG" && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.workLocationFrom}
                name="workLocationFrom"
                className="mt-1 w-1/2 p-2 border rounded"
                placeholder="from"
                onChange={handleChange}
              />
              <input
                type="text"
                value={formData.workLocationTo}
                name="workLocationTo"
                className="mt-1 w-1/2 p-2 border rounded"
                placeholder="to"
                onChange={handleChange}
              />
            </div>
          )}
          {formData.selectedDepartment === "TRD" && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.workLocationFrom}
                name="workLocationFrom"
                className="mt-1 w-1/2 p-2 border rounded"
                placeholder="from"
                onChange={handleChange}
              />
              <input
                type="text"
                value={formData.workLocationTo}
                name="workLocationTo"
                className="mt-1 w-1/2 p-2 border rounded"
                placeholder="to"
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">
            Demanded time (Click On the Clock To Select){" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="time"
              value={formData.demandTimeFrom}
              name="demandTimeFrom"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="from"
              onChange={handleChange}
            />
            <input
              type="time"
              value={formData.demandTimeTo}
              name="demandTimeTo"
              className="mt-1 w-1/2 p-2 border rounded"
              placeholder="to"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {formData.selectedDepartment === "TRD" ? (
        <div className="bg-blue-200 p-4 rounded-lg mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Coaching repercussions <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              type="text"
              name="repercussions"
              onChange={handleChange}
              value={formData.repercussions}
              className="mt-2 p-2 w-1/2 border border-slate-950 rounded"
            />
          </div>
        </div>
      ) : (
        <div className="bg-blue-200 p-4 rounded-lg mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Caution required <span style={{ color: "red" }}>*</span>
            </label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="cautionRequired"
                  value="Yes"
                  checked={formData.cautionRequired === "Yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="cautionRequired"
                  checked={formData.cautionRequired === "No"}
                  value="No"
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          {formData.cautionRequired === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">
                  Caution location <span style={{ color: "red" }}>*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.cautionLocationFrom}
                    name="cautionLocationFrom"
                    className="mt-1 w-1/2 p-2 border rounded"
                    placeholder="from"
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    value={formData.cautionLocationTo}
                    name="cautionLocationTo"
                    className="mt-1 w-1/2 p-2 border rounded"
                    placeholder="to"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Caution speed <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.cautionSpeed}
                  name="cautionSpeed"
                  className="mt-1 w-full p-2 border rounded"
                  placeholder="In format km/h"
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium">
              OHE Disconnection <span style={{ color: "red" }}>*</span>
            </label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="ohDisconnection"
                  value="Yes"
                  checked={formData.ohDisconnection === "Yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="ohDisconnection"
                  checked={formData.ohDisconnection === "No"}
                  value="No"
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          {formData.ohDisconnection === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">
                  Elementary section <span style={{ color: "red" }}>*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.elementarySectionFrom}
                    name="elementarySectionFrom"
                    className="mt-1 w-1/2 p-2 border rounded"
                    placeholder="from"
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    value={formData.elementarySectionTo}
                    name="elementarySectionTo"
                    className="mt-1 w-1/2 p-2 border rounded"
                    placeholder="to"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium">
              SIG Disconnection <span style={{ color: "red" }}>*</span>
            </label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="sigDisconnection"
                  value="Yes"
                  checked={formData.sigDisconnection === "Yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="sigDisconnection"
                  value="No"
                  checked={formData.sigDisconnection === "No"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          {formData.sigDisconnection === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">
                  {formData.selectedDepartment === "SIG" ||
                  formData.selectedDepartment === "ENGG"
                    ? "Line"
                    : "Elementary section"}{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                {formData.selectedDepartment === "SIG" ? (
                  <input
                    type="text"
                    value={formData.sigElementarySectionFrom}
                    name="sigElementarySectionFrom"
                    className="mt-1 w-1/2 p-2 border border-slate-900 rounded"
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.sigElementarySectionFrom}
                      name="sigElementarySectionFrom"
                      className="mt-1 w-1/2 p-2 border rounded"
                      placeholder="from"
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={formData.sigElementarySectionTo}
                      name="sigElementarySectionTo"
                      className="mt-1 w-1/2 p-2 border rounded"
                      placeholder="to"
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Other Affected Lines */}
      {getMissionBlock().map((ele) => {
        const arr = ele?.split("-").map((name) => name.trim());
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Other affected
              {arr?.includes("YD") ? ` Road for ${ele}` : ` Line for ${ele}`}
            </label>
            <MultipleSelectOld
              items={getTheListFilter(ele)}
              value={formData.otherLinesAffected}
              setFormData={setFormData}
              formData={formData}
              name="otherLinesAffected"
              ele={ele}
              flag={arr?.includes("YD") ? true : false}
            />
          </div>
        );
      })}

      <div className="mb-4 mt-2">
        <label className="block text-sm font-medium">Remarks</label>
        <textarea
          type="text"
          name="requestremarks"
          onChange={handleChange}
          value={formData.requestremarks}
          className="mt-2 p-2 w-full border border-slate-950 rounded"
        />
      </div>
      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          className=" text-black px-4 py-2 rounded border border-slate-900 mr-20 "
          onClick={() => {
            props.setShowPopup(false);
          }}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          onClick={formSubmitHandler}
        >
          Update
        </button>
      </div>
    </div>
  );
}
