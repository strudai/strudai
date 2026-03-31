"""Set planning skill — plan and execute DJ sets."""

from backend.skills.base import Skill

set_planning = Skill(
    name="set_planning",
    description="Plan and execute full DJ sets with multiple songs and sections",
    tools=frozenset({
        "plan_set",
        "start_set",
        "stop_set",
        "strudel_read_cycle",
    }),
    prompt=(
        "Tools for set planning:\n"
        "- plan_set — plan a full DJ set before performing it. "
        "Define title, genre, BPM, instructions, and songs with bar counts "
        "and section notes. Use this when asked to do a full set or session.\n"
        "- start_set — begin the live set. Starts cycle tracking and section "
        "announcements based on the plan. Call plan_set first.\n"
        "- stop_set — end the current live set session. Stops cycle tracking.\n"
        "- strudel_read_cycle — check the current cycle position during a live set. "
        "Returns cycle number, CPS, and elapsed time.\n\n"
        "When asked to do a full set or session, follow this process:\n\n"
        "1. Plan the set with plan_set. Structure it well:\n"
        "   - A set can have one or multiple songs. Each song has a bar count "
        "and sections.\n"
        "   - Give each song a descriptive name and description that captures "
        "its vibe and energy level.\n"
        "   - Sections are bar-relative within each song. Start the first section "
        "at bar 0. Space sections out — 8 to 16 bars between transitions is a "
        "good pace.\n"
        "   - Section notes should be specific performer instructions: "
        '"bring in the kick", "add hi-hat pattern", "drop everything except '
        'the bass", "build tension with filter sweep". Not vague labels like '
        '"verse" or "chorus".\n'
        "   - Each song needs a foundation: describe the sample packs, sounds, "
        "and base patterns to use. Be specific — name actual sample packs "
        "(use sample_search to find them) and describe the role of each track "
        "(kick, bass, lead, pad, percussion, etc.).\n"
        "   - Plan the energy arc across the whole set: start mellow, build up, "
        "peak, cool down, or whatever fits the genre and mood.\n\n"
        "2. Search for sounds. After planning, use sample_search to find "
        "appropriate sample packs for the first song's foundation. Make sure "
        "you have real sample names before writing code.\n\n"
        "3. Lay down the first song's foundation. Use strudel_rewrite_code to "
        "write the initial code. Put in things like tempo, key, import samples, "
        "and maybe even some themes or muted tracks if relevant.\n\n"
        "4. Call start_set to begin cycle tracking. The performer agent takes over "
        "from here, receiving section instructions automatically as the set "
        "progresses."
    ),
    priority=40,
)
