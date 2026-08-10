"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProposedConcept {
  id: number;
  name: string;
  mention_count: number;
}

export function CurateClient({
  initialProposed,
  initialProfile,
}: {
  initialProposed: ProposedConcept[];
  initialProfile: string;
}) {
  const [proposed, setProposed] = useState(initialProposed);
  const [approving, setApproving] = useState<number | null>(null);

  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function approve(id: number) {
    setApproving(id);
    try {
      const res = await fetch(`/api/concepts/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      setProposed((p) => p.filter((c) => c.id !== id)); // optimistic remove
    } catch {
      setApproving(null);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/config/interest-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: profile }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSavedProfile(profile);
      setSaveMsg("saved");
    } catch {
      setSaveMsg("save failed");
    } finally {
      setSaving(false);
    }
  }

  const dirty = profile !== savedProfile;

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="kicker">proposed concepts · {proposed.length}</p>
          <span className="text-xs text-muted-foreground">
            approving adds a concept to the summarizer&rsquo;s vocabulary
          </span>
        </div>
        {proposed.length === 0 ? (
          <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing awaiting review — the vocabulary is up to date.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {proposed.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm text-foreground">{c.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={approving === c.id}
                  onClick={() => approve(c.id)}
                >
                  {approving === c.id ? "approving…" : "approve"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="kicker">interest profile</p>
          <span className="text-xs text-muted-foreground">
            the prompt the scorer reads for every paper
          </span>
        </div>
        <textarea
          value={profile}
          onChange={(e) => {
            setProfile(e.target.value);
            setSaveMsg(null);
          }}
          spellCheck={false}
          className="h-80 w-full resize-y rounded-lg border border-border bg-card p-4 font-mono text-xs leading-relaxed text-foreground focus:border-primary/50 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <Button onClick={saveProfile} disabled={!dirty || saving}>
            {saving ? "saving…" : "save profile"}
          </Button>
          {saveMsg && <span className="text-xs text-muted-foreground">{saveMsg}</span>}
          {dirty && !saveMsg && (
            <span className="text-xs text-muted-foreground">unsaved changes</span>
          )}
        </div>
      </section>
    </div>
  );
}
