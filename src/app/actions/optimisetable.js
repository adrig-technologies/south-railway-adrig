"use server";

import prisma from "../../lib/prisma";
import { data } from "../../lib/store";
import { getUserUnderManager } from "./user";

export async function postDataOptimisedFirst(request) {
  const res = await prisma.sanctiontable.create({
    data: {
      Optimisedtimefrom: request.Optimisedtimefrom,
      Optimisedtimeto: request.Optimisedtimeto,
      requestId: request.requestId,
      date: request.date,
      selectedDepartment: request.selectedDepartment,
      selectedSection: request.selectedSection,
      stationID: request.stationID,
      missionBlock: request.missionBlock,
      workType: request.workType,
      workDescription: request.workDescription,
      selectedLine: request.selectedLine,
      cautionRequired: request.cautionRequired,
      cautionSpeed: request.cautionSpeed,
      cautionLocationFrom: request.cautionLocationFrom,
      cautionLocationTo: request.cautionLocationTo,
      workLocationFrom: request.workLocationFrom,
      workLocationTo: request.workLocationTo,
      demandTimeFrom: request.demandTimeFrom,
      demandTimeTo: request.demandTimeTo,
      sigDisconnection: request.sigDisconnection,
      oheDisconnection: request.oheDisconnection,
      elementarySectionFrom: request.elementarySectionFrom,
      elementarySectionTo: request.elementarySectionTo,
      sigElementarySectionFrom: request.sigElementarySectionFrom,
      sigElementarySectionTo: request.sigElementarySectionTo,
      repercussions: request.repercussions,
      otherLinesAffected: request.otherLinesAffected,
      requestremarks: request.requestremarks,
      selectedDepo: request.selectedDepo,
      corridorType: formData.corridorType,
      userId: request.userId,
      managerId: request.managerId,
      availed: JSON.stringify({ status: "pending", reason: "" }),
    },
  });

  return { result: res };
}

export async function postBulkOptimised(requestArray) {
  const filteredData = requestArray.map(
    ({ createdAt, duration, pushed, push, sigActionsNeeded, trdActionsNeeded, ...rest }) => rest
  );

  console.log(filteredData);

  const updatedData = filteredData.map((item) => {
    const {
      optimisedTimeFrom,
      optimisedTimeTo,
      ...rest
    } = item;
    return {
      ...rest,
      Optimisedtimefrom: optimisedTimeFrom,
      Optimisedtimeto: optimisedTimeTo,
      availed: JSON.stringify({ status: "pending", reason: "" }),
    };
  });

  const res = await prisma.sanctiontable.createMany({
    data: [...updatedData],
  });
  return res;
}

export async function postDataOptimised(request, action, remarks) {
  const res = await prisma.sanctiontable.update({
    where: {
      requestId: request.requestId,
    },
    data: {
      action,
      remarks,
    },
  });

  return { result: res };
}

export async function updateOptimizedData(formData, requestId) {
  const res = await prisma.sanctiontable.update({
    where: {
      requestId: requestId,
    },
    data: {
      date: formData.date,
      Optimisedtimefrom: formData.Optimisedtimefrom,
      Optimisedtimeto: formData.Optimisedtimeto,
      action: formData.action,
      remarks: formData.remarks,
    },
  });
  return res;
}

export async function getDataOptimised() {
  const res = await prisma.sanctiontable.findMany({});
  return { result: res };
}

export async function updateFinalStatus(requestId) {
  const res = await prisma.sanctiontable.update({
    where: {
      requestId: requestId,
    },
    data: {
      final: "set",
    },
  });
  return res;
}

export async function currentOptimizedData(id) {
  const res = await prisma.sanctiontable.findMany({ where: { userId: id } });
  return res;
}

export async function currentOptimizedManagerData(id) {
  const res = await prisma.sanctiontable.findMany({ where: { managerId: id } });
  return res;
}

export async function currentApprovedDataForManager(managerId) {
  const umail = await prisma.user.findMany({ where: { manager: managerId } });
  const umails = umail.map((e) => e?.id);
  let count = 0;
  for (let i = 0; i < umails.length; i++) {
    const res = await prisma.sanctiontable.findMany({ where: { userId: umails[i] } });
    for (let j = 0; j < res.length; j++) {
      count++;
    }
  }
  return count;
}

export async function currentApprovedData(id) {
  const res = await prisma.sanctiontable.findMany({ where: { userId: id } });
  let ans = 0;
  for (let i = 0; i < res.length; i++) {
    if (res[i].action != "none") {
      ans++;
    }
  }
  return ans;
}

export async function deleteOptimizedData(id) {
  const res = await prisma.sanctiontable.deleteMany({});
  return res;
}

export async function checkOptimizedData(requestId) {
  const res = await prisma.sanctiontable.findMany({ where: { requestId } });

  if (res.action == "none") {
    return null;
  } else {
    return res;
  }
}

export async function toggleStatus(requestId) {
  const res = await prisma.sanctiontable.findMany({ where: { requestId } });
  const newStatus = res.status === "completed" ? "in progress" : "completed";
  try{
    const updatedRecord = await prisma.sanctiontable.update({
      where: { requestId },
      data: { status: newStatus },
    });
  return("Status Updated");
  }
  catch{
    return("Error has occured")
  }
}

export async function updateAvailedStatus(requestId, status, reason = "", fromTime = "", toTime = "") {
  try {
    const updatedRecord = await prisma.sanctiontable.update({
      where: { requestId },
      data: { 
        availed: JSON.stringify({ 
          status, 
          reason,
          fromTime,
          toTime
        }) 
      },
    });
    return { success: true, message: "Availed status updated", data: updatedRecord };
  } catch (error) {
    console.error("Error updating availed status:", error);
    return { success: false, message: "Error updating availed status", error };
  }
}

export async function updateAdSavedStatus() {
  try {
    // First, check if any records exist
    const existingRecords = await prisma.sanctiontable.findMany({
      select: { requestId: true, adSaved: true },
      take: 10 // Just check a few records
    });
    
    console.log("Before update - sample records:", existingRecords);
    
    // Update all records
    const updatedRecords = await prisma.sanctiontable.updateMany({
      data: { 
        adSaved: "yes"
      }
    });
    
    // Verify the update worked
    const verificationRecords = await prisma.sanctiontable.findMany({
      select: { requestId: true, adSaved: true },
      take: 10 // Just check a few records
    });
    
    console.log("After update - sample records:", verificationRecords);
    
    return { 
      success: true, 
      message: `adSaved status updated to yes for ${updatedRecords.count} records`,
      count: updatedRecords.count,
      before: existingRecords,
      after: verificationRecords
    };
  } catch (error) {
    console.error("Error updating adSaved status:", error);
    return { 
      success: false, 
      message: "Error updating adSaved status",
      error: error.message
    };
  }
}
