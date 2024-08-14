const daysOfWeek: { [key: number]: string } = {
    0: "Minggu",
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu"
}

const app = {
    // size file
    max_photo_size: 2 * 1024 * 1024, // 2mb

    be_view: "/be/sb",
    fe_view: "/fe/eduzone",

    days: daysOfWeek,
}

export default app