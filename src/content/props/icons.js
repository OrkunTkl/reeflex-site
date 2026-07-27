const svg = (inner) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
    )}`

export const fishIcon = svg(
    '<path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"/><circle cx="16" cy="11" r="0.6" fill="white"/><path d="M3 12l-2-3M3 12l-2 3"/>'
)

export const flaskIcon = svg(
    '<path d="M9 2h6M10 2v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V2"/><path d="M7.5 14h9"/>'
)

export const waveIcon = svg(
    '<path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>'
)
