import { getColor } from "./theme.js"
const testingPage = document.getElementById('testing-page');
const completionPage = document.getElementById('completion-page');
const wpmDisplay = document.getElementById('wpm-final');
const accuracyDisplay = document.getElementById('accuracy-final');
const timeDisplay = document.getElementById('time-final');
const restartButton = document.getElementById('restart');

export function showCompletionPage(wpm, accuracy, time, wpmOverTime) {
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = `${accuracy}%`;
    timeDisplay.textContent = `${time}s`;

	updateWpmGraph(wpmOverTime);

    completionPage.style.display = 'flex';
    completionPage.style.opacity = '0';

    setTimeout(() => {
        completionPage.style.opacity = '1';
    }, 10);

    testingPage.style.pointerEvents = 'none';
}

export function hideCompletionPage() {
    completionPage.style.opacity = '0';
    
    setTimeout(() => {
        completionPage.style.display = 'none';
    }, 300);

    testingPage.style.pointerEvents = 'all';
}

let wpmChartInstance = null;
function updateWpmGraph(wpmOverTime) {
	const xValues = Array.from(Array(wpmOverTime.length).keys());

	// Destroy old chart for a new one
	if (wpmChartInstance) {
		wpmChartInstance.destroy();
	}

	// Get the theme colors
	const colorAccent = getColor("accent");
	const colorNeutral = getColor("neutral");

	wpmChartInstance = new Chart("myChart", {
		type: "line",
		data: {
			labels: xValues,
			datasets: [{
				data: wpmOverTime,
				label: "WPM",
				tension: 0.5,
				backgroundColor: "rgba(0,0,0,0.15)",
				pointBackgroundColor: colorAccent,
				borderColor: colorAccent,
				fill: "origin",
				hitRadius: 25,
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				hover: {
					mode: 'nearest',
					intersect: false
				},
				tooltip: {
					displayColors: false,
					yAlign: "top",
					padding: 8,
					callbacks: {
						labelColor: function(context) {
							return {
								borderColor: 'rgba(0, 0, 0, 0)',
								backgroundColor: "rgb(0,0,0)",
								borderWidth: 0,
								borderRadius: 2,
							}
						},
						title: function(tooltipItems, data) {
							return '';
						},
					}
				}
			},
            scales: {
				x: { 
					color: colorNeutral,
					font: { family: "Roboto Mono" },
					ticks: {
						color: colorNeutral,
						font: { family: "Roboto Mono" }
					}
				},
                y: {
					beginAtZero: true,
                    title: {
						color: colorNeutral,
						display: true,
                        text: 'Words per Minute',
						font: { family: "Roboto Mono" },
                    },
					font: { family: "Roboto Mono" },
					ticks: {
						color: colorNeutral,
						font: { family: "Roboto Mono" }
					}
                }
            },
			animation: {
				x: {
					duration: 0,
					from: 0
				},
				y: {
					duration: 800,
					from: 200
				}
			}
        }

	});
}
