"use client";

import { useState } from "react";
import {
  Info,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";


const ApplicableCriteria = () => {
  const [gender, setGender] = useState("All");
  const [ageType, setAgeType] = useState("Years");
  const [ageFrom, setAgeFrom] = useState("0");
  const [ageTo, setAgeTo] = useState("120");

  const [allAges, setAllAges] = useState(true);
  const [pregnancyApplicable, setPregnancyApplicable] =
    useState(false);

  const [tags, setTags] = useState([
    "Pediatric",
    "Pediatric",
    "Geriatric",
  ]);

  const addTag = () => {
    const value = prompt("Enter Tag");

    if (!value) return;

    setTags([...tags, value]);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-pneutral-200 px-6 py-4">

        <div className="flex items-start gap-2">

          <div className="mt-3 flex items-center justify-center">

            <Info
              size={20}
              className="text-secondary-600"
            />

          </div>

          <div>

            <h2 className="text-p4 font-semibold text-pneutral-900">
              Applicable Criteria
            </h2>

            <p className=" text-p2 text-pneutral-500">
              Demographic applicability for this reference
            </p>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="space-y-6 p-6">

        {/* Inputs */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* Gender */}

          <div>

            <label className="px-1 block text-label-l3 font-medium text-pneutral-900">
              Gender
            </label>

            <div className="relative">

              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value)
                }
                className="h-9 w-full appearance-none rounded-md border border-pneutral-300 bg-white px-3 pr-5 outline-none focus:border-secondary-500"
              >
                <option>All</option>
                <option>Male</option>
                <option>Female</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pneutral-400"
                size={18}
              />

            </div>

          </div>

          {/* Age Type */}

          <div>

            <label className="px-1 block text-label-l3 font-medium text-pneutral-900">
              Age Type
            </label>

            <div className="relative">

              <select
                value={ageType}
                onChange={(e) =>
                  setAgeType(e.target.value)
                }
                className="h-9 w-full appearance-none rounded-md border border-pneutral-300 bg-white px-3 pr-5 outline-none focus:border-secondary-500"
              >
                <option>Years</option>
                <option>Months</option>
                <option>Days</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pneutral-400"
                size={18}
              />

            </div>

          </div>

          {/* Age From */}

          <div>

            <label className="px-1 block text-label-l3 font-medium text-pneutral-900">
              Age From
            </label>

            <input
              value={ageFrom}
              onChange={(e) =>
                setAgeFrom(e.target.value)
              }
              className="h-9 w-full appearance-none rounded-md border border-pneutral-300 bg-white px-3 pr-5 outline-none focus:border-secondary-500"
            />

          </div>

          {/* Age To */}

          <div>

            <label className="px-1 block text-label-l3 font-medium text-pneutral-900">
              Age To
            </label>

            <input
              value={ageTo}
              onChange={(e) =>
                setAgeTo(e.target.value)
              }
              className="h-9 w-full appearance-none rounded-md border border-pneutral-300 bg-white px-3 pr-5 outline-none focus:border-secondary-500"
            />

          </div>

        </div>

        {/* Toggles */}

        <div className="grid gap-6 md:grid-cols-2">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setAllAges(!allAges)
              }
              className={`relative h-6 w-12 rounded-full transition

              ${
                allAges
                  ? "bg-secondary-700"
                  : "bg-pneutral-300"
              }`}
            >

              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all

                ${
                  allAges
                    ? "left-7"
                    : "left-1"
                }`}
              />

            </button>

            <span className="font-semibold text-pneutral-900 text-p2">
              Applicable for all ages
            </span>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setPregnancyApplicable(
                  !pregnancyApplicable
                )
              }
              className={`relative h-6 w-12 rounded-full transition

              ${
                pregnancyApplicable
                  ? "bg-secondary-700"
                  : "bg-pneutral-300"
              }`}
            >

              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all

                ${
                  pregnancyApplicable
                    ? "left-7"
                    : "left-1"
                }`}
              />

            </button>

            <span className="font-semibold text-pneutral-900 text-p2">
              Pregnancy applicable
            </span>

          </div>

        </div>

        {/* Tags */}

        <div className="flex flex-wrap items-center gap-3">

          <span className="font-semibold text-pneutral-900 text-p2">
            Tags:
          </span>

          {tags.map((tag, index) => (

            <div
              key={index}
              className="flex items-center gap-2 rounded-full border border-secondary-600 bg-secondary-100 px-4 py-2 text-p2 font-medium text-secondary-700"
            >

              {tag}

              <button
                onClick={() =>
                  removeTag(index)
                }
              >
                <X size={16} />
              </button>

            </div>

          ))}

          <button
            onClick={addTag}
            className="flex items-center gap-2 rounded-full border border-dashed border-secondary-600 bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-violet-100"
          >

            <Plus size={16} />

            Add Tag

          </button>

        </div>

      </div>

    </div>
  );
}
export default  ApplicableCriteria;