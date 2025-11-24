const API_URL = "https://nba-random-forest-predictor.fly.dev/predictions/today";

const TEAM_LOGOS = {
    ATL: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
    BOS: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    BKN: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
    CHA: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png",
    CHI: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    CLE: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
    DAL: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
    DEN: "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
    DET: "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
    GSW: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
    HOU: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png",
    IND: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png",
    LAC: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
    LAL: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    MEM: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png",
    MIA: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
    MIL: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
    MIN: "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
    NOP: "https://a.espncdn.com/i/teamlogos/nba/500/no.png",
    NYK: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
    OKC: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
    ORL: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png",
    PHI: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
    PHX: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
    POR: "https://a.espncdn.com/i/teamlogos/nba/500/por.png",
    SAC: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png",
    SAS: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png",
    TOR: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
    UTA: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png",
    WAS: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png",
};

document.getElementById("loadBtn").addEventListener("click", loadPredictions);

async function loadPredictions() {
    const container = document.getElementById("gamesContainer");
    const statusText = document.getElementById("statusText");
    const dateText = document.getElementById("dateText");

    container.innerHTML = "";
    statusText.textContent = "Loading predictions...";
    dateText.textContent = "";

    container.innerHTML = `
        <div class="empty-state">
            Fetching today’s schedule and computing rolling stats...
        </div>
    `;

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        statusText.textContent =
            data.games.length === 0
                ? "No games found for today."
                : `Showing ${data.games.length} games.`;
        dateText.textContent = `Model date: ${data.date}`;

        container.innerHTML = "";

        if (data.games.length === 0) {
            container.innerHTML = `
                <div class="empty-state">No NBA games scheduled today.</div>
            `;
            return;
        }

        data.games.forEach((game, index) => {
            const homeProb = game.home_win_prob * 100;
            const awayProb = game.away_win_prob * 100;

            const favorite = homeProb > awayProb ? game.home_abbr : game.away_abbr;
            const favoriteProb = Math.max(homeProb, awayProb);

            const homeLogo = TEAM_LOGOS[game.home_abbr] || "";
            const awayLogo = TEAM_LOGOS[game.away_abbr] || "";

            const card = document.createElement("div");
            card.className = "game-card";
            card.style.setProperty("--delay", `${index * 70}ms`);

            card.innerHTML = `
                <div class="card-header">
                    <div class="team-block home">
                        <div class="logo-wrap">
                            <img src="${homeLogo}" alt="${game.home_abbr}" class="team-logo" />
                        </div>
                        <div>
                            <div class="team-text-main">${game.home_abbr}</div>
                            <div class="team-text-sub">Home</div>
                        </div>
                    </div>

                    <div class="vs-pill">vs</div>

                    <div class="team-block away">
                        <div>
                            <div class="team-text-main">${game.away_abbr}</div>
                            <div class="team-text-sub">Away</div>
                        </div>
                        <div class="logo-wrap">
                            <img src="${awayLogo}" alt="${game.away_abbr}" class="team-logo" />
                        </div>
                    </div>
                </div>

                <div class="prob-section">
                    <div class="prob-row">
                        <span class="prob-label">Home Win Probability</span>
                        <span class="prob-value">${homeProb.toFixed(1)}%</span>
                    </div>
                    <div class="prob-bar">
                        <div class="prob-bar-fill" data-fill="${homeProb.toFixed(1)}"></div>
                    </div>

                    <div class="prob-row">
                        <span class="prob-label">Away Win Probability</span>
                        <span class="prob-value">${awayProb.toFixed(1)}%</span>
                    </div>
                    <div class="prob-bar">
                        <div class="prob-bar-fill" data-fill="${awayProb.toFixed(1)}"></div>
                    </div>
                </div>

                <div class="edge-row">
                    <div class="favorite-tag">
                        Favorite: ${favorite} (${favoriteProb.toFixed(1)}%)
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        requestAnimationFrame(() => {
            document.querySelectorAll(".prob-bar-fill").forEach((el) => {
                const pct = el.getAttribute("data-fill");
                el.style.width = `${pct}%`;
            });
        });
    } catch (err) {
        console.error(err);
        statusText.textContent = "Error loading predictions.";
        dateText.textContent = "";
        container.innerHTML = `
            <div class="error-state">
                Error fetching predictions.
                <br>Check that the backend is running at <code>${API_URL}</code>.
            </div>
        `;
    }
}
