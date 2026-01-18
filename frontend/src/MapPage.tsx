import {useEffect, useRef, useState} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Chatbot from "./Chatbot";

interface MapPageProps {
    onBack: () => void;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (TOKEN) mapboxgl.accessToken = TOKEN;

/**
 * ======================================================
 * 16 Cultural Regions — Full Coverage
 * ======================================================
 */
const CULTURAL_DISTRICTS = [
    // 1 Chinatown
    {
        id: "chinatown",
        name: "Chinatown (Dundas)",
        color: "#E53935",
        polygon: [
            [-79.407, 43.6508],
            [-79.4045, 43.6498],
            [-79.4015, 43.6492],
            [-79.3985, 43.6495],
            [-79.3958, 43.6505],
            [-79.394, 43.6522],
            [-79.3948, 43.654],
            [-79.3975, 43.6558],
            [-79.4008, 43.6565],
            [-79.404, 43.656],
            [-79.4068, 43.6542],
            [-79.4078, 43.6522],
        ],
        location: "Dundas St W & Spadina Ave",
        primary_community: "Chinese (Cantonese / Mandarin)",
        service_languages: ["Cantonese", "Mandarin", "English"],
        key_services_needed: [
            "Chinese-language senior services",
            "Settlement services",
            "Culturally appropriate healthcare",
        ],
    },

    // 2 Little Italy
    {
        id: "little_italy",
        name: "Little Italy",
        color: "#43A047",
        polygon: [
            [-79.424, 43.6525],
            [-79.42, 43.6518],
            [-79.416, 43.6512],
            [-79.412, 43.6518],
            [-79.4105, 43.6535],
            [-79.412, 43.656],
            [-79.4165, 43.6575],
            [-79.421, 43.6578],
            [-79.4245, 43.656],
        ],
        location: "College St",
        primary_community: "Italian-Canadians",
        service_languages: ["Italian", "English"],
        key_services_needed: [
            "Italian-language senior programs",
            "Cultural preservation",
            "Small business support",
        ],
    },

    // 3 Greektown
    {
        id: "greektown",
        name: "Greektown (The Danforth)",
        color: "#3949AB",
        polygon: [
            [-79.355, 43.676],
            [-79.35, 43.6755],
            [-79.345, 43.675],
            [-79.34, 43.6755],
            [-79.3375, 43.6775],
            [-79.339, 43.68],
            [-79.344, 43.6815],
            [-79.35, 43.6818],
            [-79.3545, 43.68],
        ],
        location: "Danforth Ave",
        primary_community: "Greek-Canadians",
        service_languages: ["Greek", "English"],
        key_services_needed: [
            "Greek healthcare services",
            "Senior programs",
            "Language education",
        ],
    },

    // 4 Little Portugal
    {
        id: "little_portugal",
        name: "Little Portugal",
        color: "#FB8C00",
        polygon: [
            [-79.4325, 43.6495],
            [-79.428, 43.6488],
            [-79.423, 43.6485],
            [-79.419, 43.6498],
            [-79.42, 43.6525],
            [-79.4245, 43.6545],
            [-79.4295, 43.655],
            [-79.433, 43.653],
        ],
        location: "Dundas St W",
        primary_community: "Portuguese immigrants",
        service_languages: ["Portuguese", "English"],
        key_services_needed: [
            "Portuguese legal services",
            "Senior care",
            "Trades workforce support",
        ],
    },

    // 5 Koreatown
    {
        id: "koreatown",
        name: "Koreatown",
        color: "#1E88E5",
        polygon: [
            [-79.423, 43.6608],
            [-79.419, 43.66],
            [-79.4145, 43.6595],
            [-79.411, 43.6605],
            [-79.4105, 43.663],
            [-79.413, 43.6655],
            [-79.4175, 43.6665],
            [-79.422, 43.665],
        ],
        location: "Bloor St W",
        primary_community: "Korean immigrants and students",
        service_languages: ["Korean", "English"],
        key_services_needed: [
            "Korean mental health services",
            "Student employment support",
            "Credential recognition",
        ],
    },

    // 6 J-Town
    {
        id: "jtown",
        name: "J-Town (Japanese Community)",
        color: "#8E24AA",
        polygon: [
            [-79.3365, 43.82],
            [-79.332, 43.819],
            [-79.327, 43.8192],
            [-79.3235, 43.821],
            [-79.3245, 43.824],
            [-79.3285, 43.826],
            [-79.3335, 43.8258],
            [-79.337, 43.8235],
        ],
        location: "Steeles Ave & Victoria Park",
        primary_community: "Japanese expatriates",
        service_languages: ["Japanese", "English"],
        key_services_needed: [
            "Japanese schooling support",
            "Corporate relocation services",
            "Family integration",
        ],
    },

    // 7 Little India
    {
        id: "little_india",
        name: "Little India (Gerrard Bazaar)",
        color: "#6A1B9A",
        polygon: [
            [-79.329, 43.669],
            [-79.325, 43.6685],
            [-79.3205, 43.6682],
            [-79.316, 43.6685],
            [-79.3125, 43.67],
            [-79.3118, 43.6722],
            [-79.3135, 43.6742],
            [-79.317, 43.6758],
            [-79.3215, 43.6762],
            [-79.326, 43.6758],
            [-79.3295, 43.674],
        ],
        location: "Gerrard St E",
        primary_community: "South Asian communities",
        service_languages: ["Hindi", "Urdu", "Punjabi", "Tamil", "English"],
        key_services_needed: [
            "Settlement services",
            "Women employment programs",
            "Cultural healthcare access",
        ],
    },

    // 8 North York Persian
    {
        id: "north_york_persian",
        name: "North York Persian Community",
        color: "#6D4C41",
        polygon: [
            [-79.43, 43.78],
            [-79.425, 43.779],
            [-79.419, 43.7792],
            [-79.414, 43.781],
            [-79.4145, 43.785],
            [-79.4195, 43.7885],
            [-79.426, 43.789],
            [-79.431, 43.7855],
        ],
        location: "Yonge St (Finch–Steeles)",
        primary_community: "Iranian (Persian) immigrants",
        service_languages: ["Persian", "English"],
        key_services_needed: [
            "Credential recognition",
            "Mental health services",
            "Community arts support",
        ],
    },

    // 9 Thorncliffe Park
    {
        id: "thorncliffe_park",
        name: "Thorncliffe Park",
        color: "#00897B",
        polygon: [
            [-79.345, 43.7045],
            [-79.34, 43.7038],
            [-79.335, 43.7042],
            [-79.3315, 43.7065],
            [-79.333, 43.7105],
            [-79.3375, 43.7125],
            [-79.343, 43.712],
            [-79.3475, 43.709],
        ],
        location: "Overlea Blvd",
        primary_community: "Middle Eastern immigrants",
        service_languages: ["Arabic", "English"],
        key_services_needed: [
            "Settlement services",
            "Women employment",
            "Public health outreach",
        ],
    },

    // 10 Scarborough Tamil
    {
        id: "scarborough_tamil",
        name: "Scarborough Tamil Community",
        color: "#C62828",
        polygon: [
            [-79.2495, 43.7448],
            [-79.2445, 43.744],
            [-79.2395, 43.7445],
            [-79.2355, 43.7468],
            [-79.237, 43.7508],
            [-79.2415, 43.7528],
            [-79.247, 43.7522],
            [-79.2505, 43.7492],
        ],
        location: "Markham Rd & Eglinton Ave E",
        primary_community: "Sri Lankan Tamil immigrants",
        service_languages: ["Tamil", "English"],
        key_services_needed: [
            "Refugee support",
            "Youth education",
            "Mental health services",
        ],
    },

    // 11 East York Caribbean
    {
        id: "east_york_caribbean",
        name: "East York Caribbean Community",
        color: "#F4511E",
        polygon: [
            [-79.3135, 43.7028],
            [-79.309, 43.702],
            [-79.304, 43.7025],
            [-79.3005, 43.7048],
            [-79.302, 43.7088],
            [-79.3065, 43.7108],
            [-79.312, 43.71],
            [-79.3155, 43.707],
        ],
        location: "Eglinton Ave E",
        primary_community: "Caribbean communities",
        service_languages: ["English", "Caribbean Creoles"],
        key_services_needed: [
            "Youth mentorship",
            "Mental health support",
            "Arts funding",
        ],
    },

    // 12 Weston Latin American
    {
        id: "weston_latin_american",
        name: "Weston Latin American Community",
        color: "#7CB342",
        polygon: [
            [-79.528, 43.6995],
            [-79.523, 43.6988],
            [-79.518, 43.6992],
            [-79.514, 43.7015],
            [-79.5155, 43.7055],
            [-79.5205, 43.7075],
            [-79.526, 43.707],
            [-79.5295, 43.704],
        ],
        location: "Weston Rd & Lawrence Ave W",
        primary_community: "Latin American immigrants",
        service_languages: ["Spanish", "English"],
        key_services_needed: [
            "Settlement services",
            "Legal support",
            "Employment placement",
        ],
    },

    // 13 Rexdale Somali
    {
        id: "somali_rexdale",
        name: "Rexdale Somali Community",
        color: "#00695C",
        polygon: [
            [-79.586, 43.735],
            [-79.579, 43.734],
            [-79.572, 43.7338],
            [-79.565, 43.735],
            [-79.5585, 43.7375],
            [-79.557, 43.742],
            [-79.56, 43.7465],
            [-79.5665, 43.7495],
            [-79.574, 43.75],
            [-79.581, 43.747],
            [-79.5865, 43.7425],
        ],
        location: "Islington Ave & Finch Ave W",
        primary_community: "Somali immigrants",
        service_languages: ["Somali", "English"],
        key_services_needed: [
            "Settlement services",
            "Youth employment",
            "Community mediation",
        ],
    },

    // 14 Bathurst Jewish
    {
        id: "jewish_bathurst",
        name: "Bathurst Jewish Community",
        color: "#283593",
        polygon: [
            [-79.444, 43.7395],
            [-79.439, 43.7388],
            [-79.434, 43.7392],
            [-79.4305, 43.7415],
            [-79.432, 43.7455],
            [-79.4365, 43.7478],
            [-79.442, 43.7472],
            [-79.4455, 43.744],
        ],
        location: "Bathurst St",
        primary_community: "Jewish communities",
        service_languages: ["English", "Hebrew"],
        key_services_needed: [
            "Kosher food access",
            "Senior services",
            "Community safety",
        ],
    },

    // 15 Kensington Market (补充)
    {
        id: "kensington_market",
        name: "Kensington Market",
        color: "#FF7043",
        polygon: [
            [-79.4065, 43.6545],
            [-79.402, 43.6538],
            [-79.398, 43.654],
            [-79.3975, 43.6565],
            [-79.4005, 43.659],
            [-79.4055, 43.6592],
            [-79.408, 43.657],
        ],
        location: "Kensington Ave",
        primary_community: "Multi-ethnic / Artists / Immigrants",
        service_languages: ["English", "Spanish", "Chinese"],
        key_services_needed: [
            "Small business protection",
            "Cultural preservation",
            "Affordable housing advocacy",
        ],
    },

    // 16 Agincourt Chinese (补充)
    {
        id: "agincourt_chinese",
        name: "Agincourt Chinese Community",
        color: "#D81B60",
        polygon: [
            [-79.305, 43.785],
            [-79.298, 43.784],
            [-79.292, 43.7845],
            [-79.288, 43.787],
            [-79.2895, 43.791],
            [-79.294, 43.793],
            [-79.3, 43.792],
            [-79.3055, 43.789],
        ],
        location: "Sheppard Ave E & Midland Ave",
        primary_community: "Chinese (Mandarin)",
        service_languages: ["Mandarin", "English"],
        key_services_needed: [
            "Senior services",
            "Healthcare navigation",
            "New immigrant settlement",
        ],
    },
];

export default function MapPage({ onBack }: MapPageProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const [chatbotSelectedPlace, setChatbotSelectedPlace] = useState<any>(null);

    useEffect(() => {
        if (!TOKEN || !mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [-79.3832, 43.6532],
            zoom: 10,
        });

        map.on("load", () => {
            CULTURAL_DISTRICTS.forEach((d) => {
                map.addSource(d.id, {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [[...d.polygon, d.polygon[0]]],
                        },
                        properties: d,
                    },
                });

                map.addLayer({
                    id: `${d.id}-fill`,
                    type: "fill",
                    source: d.id,
                    paint: {
                        "fill-color": d.color,
                        "fill-opacity": 0.32,
                    },
                });

                map.addLayer({
                    id: `${d.id}-label`,
                    type: "symbol",
                    source: d.id,
                    layout: {
                        "text-field": ["get", "name"],
                        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 13, 16],
                    },
                    paint: {
                        "text-color": "#111",
                        "text-halo-color": "#fff",
                        "text-halo-width": 1.5,
                    },
                });

                map.on("click", `${d.id}-fill`, (e) => {
                    const p = e.features?.[0]?.properties;
                    if (!p) return;

                    new mapboxgl.Popup({maxWidth: "340px"})
                        .setLngLat(e.lngLat)
                        .setHTML(`
              <strong>${p.name}</strong><br/>
              <b>Location:</b> ${p.location}<br/>
              <b>Community:</b> ${p.primary_community}<br/>
              <b>Languages:</b> ${JSON.parse(p.service_languages).join(", ")}<br/>
              <b>Key Needs:</b>
              <ul>
                ${JSON.parse(p.key_services_needed).map((x: string) => `<li>${x}</li>`).join("")}
              </ul>
            `)
                        .addTo(map);
                });

                map.on("mouseenter", `${d.id}-fill`, () => {
                    map.getCanvas().style.cursor = "pointer";
                });
                map.on("mouseleave", `${d.id}-fill`, () => {
                    map.getCanvas().style.cursor = "";
                });
            });
        });

        return () => map.remove();
    }, []);

    const handleChatbotPlaceSelect = (place: any) => {
        console.log('Chatbot selected place:', place);
        setChatbotSelectedPlace(place);

    }
    return (
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
            <div ref={mapContainerRef} style={{ position: "absolute", inset: 0 }} />

            <button
                onClick={onBack}
                style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 10,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.75)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                ← Return
            </button>

            <Chatbot
                onPlaceSelect={handleChatbotPlaceSelect}
                userCity="Toronto"
            />
        </div>
    );
}