export interface CommitteeChair {
  name: string
  title: string
  phone: string
  contactUrl: string
}

export const committeeChairs: Record<string, CommitteeChair> = {
  "Committee on Energy and Commerce": {
    name: "Brett Guthrie",
    title: "Chair, House Committee on Energy and Commerce",
    phone: "(202) 225-3501",
    contactUrl: "https://guthrie.house.gov/contact",
  },
  "Committee on Ways and Means": {
    name: "Jason Smith",
    title: "Chair, House Committee on Ways and Means",
    phone: "(202) 225-4404",
    contactUrl: "https://jasonsmith.house.gov/contact",
  },
  "Committee on the Judiciary": {
    name: "Jim Jordan",
    title: "Chair, House Committee on the Judiciary",
    phone: "(202) 225-2676",
    contactUrl: "https://jordan.house.gov/contact",
  },
  "Committee on Armed Services": {
    name: "Mike Rogers",
    title: "Chair, House Committee on Armed Services",
    phone: "(202) 225-3261",
    contactUrl: "https://mikerogers.house.gov/contact",
  },
  "Committee on Financial Services": {
    name: "French Hill",
    title: "Chair, House Committee on Financial Services",
    phone: "(202) 225-2506",
    contactUrl: "https://frenchhill.house.gov/contact",
  },
  "Committee on Education and the Workforce": {
    name: "Tim Walberg",
    title: "Chair, House Committee on Education and the Workforce",
    phone: "(202) 225-4401",
    contactUrl: "https://walberg.house.gov/contact",
  },
  "Committee on Oversight and Accountability": {
    name: "James Comer",
    title: "Chair, House Committee on Oversight and Accountability",
    phone: "(202) 225-3115",
    contactUrl: "https://comer.house.gov/contact",
  },
  "Committee on Transportation and Infrastructure": {
    name: "Sam Graves",
    title: "Chair, House Committee on Transportation and Infrastructure",
    phone: "(202) 225-7041",
    contactUrl: "https://graves.house.gov/contact",
  },
  "Committee on Agriculture": {
    name: "GT Thompson",
    title: "Chair, House Committee on Agriculture",
    phone: "(202) 225-5121",
    contactUrl: "https://gtthompson.house.gov/contact",
  },
  "Committee on Natural Resources": {
    name: "Bruce Westerman",
    title: "Chair, House Committee on Natural Resources",
    phone: "(202) 225-3772",
    contactUrl: "https://westerman.house.gov/contact",
  },
  "Committee on Foreign Affairs": {
    name: "Brian Mast",
    title: "Chair, House Committee on Foreign Affairs",
    phone: "(202) 225-3026",
    contactUrl: "https://mast.house.gov/contact",
  },
  "Committee on Appropriations": {
    name: "Tom Cole",
    title: "Chair, House Committee on Appropriations",
    phone: "(202) 225-6165",
    contactUrl: "https://cole.house.gov/contact",
  },
  "Committee on Science, Space, and Technology": {
    name: "Brian Babin",
    title: "Chair, House Committee on Science, Space, and Technology",
    phone: "(202) 225-1555",
    contactUrl: "https://babin.house.gov/contact",
  },
  "Committee on Small Business": {
    name: "Roger Williams",
    title: "Chair, House Committee on Small Business",
    phone: "(202) 225-9896",
    contactUrl: "https://williams.house.gov/contact",
  },
  "Committee on Veterans' Affairs": {
    name: "Mike Bost",
    title: "Chair, House Committee on Veterans' Affairs",
    phone: "(202) 225-5201",
    contactUrl: "https://bost.house.gov/contact",
  },
  "Committee on Health, Education, Labor, and Pensions": {
    name: "Bill Cassidy",
    title: "Chair, Senate Committee on Health, Education, Labor, and Pensions",
    phone: "(202) 224-5824",
    contactUrl: "https://www.cassidy.senate.gov/contact",
  },
  "Committee on Finance": {
    name: "Mike Crapo",
    title: "Chair, Senate Committee on Finance",
    phone: "(202) 224-6142",
    contactUrl: "https://www.crapo.senate.gov/contact",
  },
  "Committee on the Judiciary (Senate)": {
    name: "Chuck Grassley",
    title: "Chair, Senate Committee on the Judiciary",
    phone: "(202) 224-3744",
    contactUrl: "https://www.grassley.senate.gov/contact",
  },
  "Committee on Armed Services (Senate)": {
    name: "Roger Wicker",
    title: "Chair, Senate Committee on Armed Services",
    phone: "(202) 224-6253",
    contactUrl: "https://www.wicker.senate.gov/contact",
  },
  "Committee on Commerce, Science, and Transportation": {
    name: "Ted Cruz",
    title: "Chair, Senate Committee on Commerce, Science, and Transportation",
    phone: "(202) 224-5922",
    contactUrl: "https://www.cruz.senate.gov/contact",
  },
}

export function getCommitteeChair(actionText: string): CommitteeChair | null {
  if (!actionText) return null
  for (const [committeeName, chair] of Object.entries(committeeChairs)) {
    if (actionText.toLowerCase().includes(committeeName.toLowerCase())) {
      return chair
    }
  }
  return null
}