import { describe, expect, it } from "vitest";
import opening from "@/content/opening.json";
import { STORED_POLLS, voteLinkText, voteUrl } from "@/config";
import { parseVoteFile, tallyVoteFiles, voteFileName } from "./stored-votes";

const A = "0b5c3a8e-1111-4c2d-9e7f-aaaaaaaaaaaa";
const B = "0b5c3a8e-2222-4c2d-9e7f-bbbbbbbbbbbb";

describe("bucket-stored poll votes", () => {
  it("s2-challenge has four options and is stored in the bucket", () => {
    expect(opening.poll.options).toHaveLength(4);
    expect(STORED_POLLS).toEqual(["s2-challenge"]);
  });

  it("round-trips voter and option through the file name", () => {
    expect(parseVoteFile(voteFileName(A, 4))).toEqual({ voter: A, option: 4 });
    expect(parseVoteFile("bad.json")).toBeNull();
  });

  it("counts the newest vote per voter and ignores out-of-range options", () => {
    const t = tallyVoteFiles(
      [
        { name: voteFileName(A, 1), at: "2026-10-12T17:00:01Z" },
        { name: voteFileName(A, 4), at: "2026-10-12T17:00:05Z" },
        { name: voteFileName(B, 2), at: "2026-10-12T17:00:03Z" },
        { name: `${B}.5.json`, at: "2026-10-12T17:00:09Z" },
      ],
      4,
    );
    expect(t.counts).toEqual([0, 1, 0, 1]);
    expect(t.rows.map((r) => r.option)).toEqual([2, 4]);
  });

  it("slide 2 prints exactly the URL its QR encodes, without the scheme", () => {
    expect(voteLinkText("s2-challenge")).toBe("brainsmingle-ai-era-software-engineering.lovable.app/vote?poll=s2-challenge");
    expect(`https://${voteLinkText("s2-challenge")}`).toBe(voteUrl("s2-challenge"));
  });
});
