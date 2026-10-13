import { TestReferancePoint } from "@/types/test/testlist";

/**
 * Label for a reference point in result entry / saved report rows.
 * The parameter-master name wins when set; DETAILED REPORT keeps its description because
 * downstream report code detects imaging rows by that exact value.
 */
export const getPointLabel = (
  point: Pick<TestReferancePoint, "testDescription" | "parameterName">
): string => {
  if ((point.testDescription || "").toUpperCase() === "DETAILED REPORT") {
    return point.testDescription;
  }
  return point.parameterName?.trim() || point.testDescription || "";
};
