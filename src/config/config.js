const config = {
  data: {
    // Main invitation title that appears on the page
    title: "The Wedding of Shaun & Manon",
    // Opening message/description of the invitation
    description:
      "We are getting married and invite you to celebrate this special moment with us.",
    // Groom's name
    groomName: "Shaun",
    // Bride's name
    brideName: "Manon",
    // Groom's parents names
    parentGroom: "Mr. Groom & Mrs. Groom",
    // Bride's parents names
    parentBride: "Mr. Bride & Mrs. Bride",
    // Wedding date (format: YYYY-MM-DD)
    date: "2024-12-24",
    // Google Maps link for location (short clickable link)
    maps_url: "https://goo.gl/maps/abcdef",
    // Google Maps embed code to display map on website
    // How to get: open Google Maps → select location → Share → Embed → copy link
    maps_embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0000000000005!2d106.8270733147699!3d-6.175392995514422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f4f1b6d7b1e7%3A0x2e69f4f1b6d7b1e7!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1633666820004!5m2!1sid!2sid",
    // Event time (free format, example: "10:00 - 12:00 WIB")
    time: "4:16 PM - 5:30 PM",
    // Venue/building name
    location: "Grand Ballroom, Hotel Majesty",
    // Full address of the wedding venue
    address: "1st Sudirman St., Jakarta",
    // Image that appears when link is shared on social media
    ogImage: "/images/og-image.jpg",
    // Icon that appears in browser tab
    favicon: "/images/favicon.ico",
    // List of event agenda/schedule
    agenda: [
      {
        // First event name
        title: "Wedding Ceremony",
        // Event date (format: YYYY-MM-DD)
        date: "2024-12-24",
        // Start time (format: HH:MM)
        startTime: "16:16",
        // End time (format: HH:MM)
        endTime: "17:30",
        // Event venue
        location: "Grand Ballroom, Hotel Majesty",
        // Full address
        address: "1st Sudirman St., Jakarta",
      },
      {
        // Second event name
        title: "Wedding Reception",
        date: "2024-12-24",
        startTime: "18:30",
        endTime: "21:00",
        location: "Grand Ballroom, Hotel Majesty",
        address: "1st Sudirman St., Jakarta",
      },
      // You can add more agenda items with the same format
    ],

    // Story Timeline
    timeline: [
      {
        year: "2020",
        title: "The First Meeting",
        description: "Where our journey began, under the autumn leaves.",
      },
      {
        year: "2022",
        title: "The Proposal",
        description:
          "A magical moment by the sea where we said 'Yes' to forever.",
      },
      {
        year: "2024",
        title: "The Big Day",
        description: "Celebrating our love with all of you.",
      },
    ],

    // Wedding Weekend Schedule
    schedule: [
      {
        day: "Friday",
        events: [
          {
            time: "4:00 PM - 6:00 PM",
            title: "Arrival & Check-in",
            description: "Welcome to the countryside! Settle into your rooms.",
          },
          {
            time: "6:00 PM - 7:00 PM",
            title: "Welcome Drinks",
            description:
              "Join us for local wine and appetizers on the terrace.",
          },
          {
            time: "7:00 PM - Late",
            title: "BBQ & Festivities",
            description:
              "Casual outdoor dinner and music to kick off the weekend.",
          },
        ],
      },
      {
        day: "Saturday",
        events: [
          {
            time: "11:00 AM",
            title: "Garden Yoga",
            description: "Optional morning stretch for early birds.",
          },
          {
            time: "3:30 PM",
            title: "Wedding Ceremony",
            description: "The main event under the big oak tree.",
          },
          {
            time: "5:00 PM",
            title: "Cocktail Hour",
            description: "Drinks and music in the courtyard.",
          },
          {
            time: "7:00 PM",
            title: "Dinner & Dancing",
            description: "Feast, speeches, and plenty of dancing.",
          },
        ],
      },
      {
        day: "Sunday",
        events: [
          {
            time: "10:00 AM",
            title: "Farewell Brunch",
            description: "A relaxed morning meal before we say our goodbyes.",
          },
        ],
      },
    ],

    /* 
    // Background music settings (Disabled)
    audio: {
      src: "/audio/fulfilling-humming.mp3",
      title: "Fulfilling Humming",
      autoplay: false,
      loop: true,
    },
    */
  },
};

export default config;
