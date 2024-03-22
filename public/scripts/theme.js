export function applyTheme(themeName) {
    fetch("../data/themes.json")
        .then((response) => response.json())
        .then((themes) => {
            if (themes[themeName]) {
                const root = document.documentElement;

                // Check if the new theme is different from the current theme
                if (
                    root.style.getPropertyValue("--background") !==
                    themes[themeName]["--background"]
                ) {
                    Object.keys(themes[themeName]).forEach((key) => {
                        root.style.setProperty(key, themes[themeName][key]);
                    });
                }
            } else {
                console.log("Theme not found");
            }
        })
        .catch((error) => console.error("Error fetching themes:", error));
}

export function getColor(name) {
    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles.getPropertyValue("--" + name).trim(); // .trim() to remove any potential whitespace

    if (accentColor) {
        return accentColor;
    } else {
        console.error("Error: --" + name + " CSS variable is not defined.");
        return '#000000';
    }
}
