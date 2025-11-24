import { useEffect, useState,useRef } from "react";
import ChatBox from "./chatBox";
import { io } from "socket.io-client";
 const socket = io("https://travel-agi-backend.up.railway.app");

// Persona Display Component
function PersonaDisplay({ persona }) {
  const formatPercentage = (value) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  const formatTime = (hours) => {
    if (hours === 0) return "0 hours";
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = (hours % 24).toFixed(1);
    return `${days} day${days !== 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours} hours` : ''}`;
  };

  const ProgressBar = ({ label, value, max = 100 }) => (
    <div className="progress-item">
      <div className="progress-label-row">
        <span className="progress-label">{label}</span>
        <span className="progress-value">{formatPercentage(value)}</span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, subtitle, icon }) => (
    <div className="stat-card">
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const PreferenceGrid = ({ title, preferences }) => {
    if (!preferences || Object.keys(preferences).length === 0) return null;
    
    return (
      <div className="preference-section">
        <h4 className="section-subtitle">{title}</h4>
        <div className="preference-grid">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="preference-item">
              <div className="progress-label-row">
                <div className="preference-label">{key}</div>
                <div className="preference-value">{formatPercentage(value)}</div>
              </div>
              <div className="preference-bar-container">
                <div 
                  className="preference-bar" 
                  style={{ width: `${Math.min(value, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RouteCard = ({ route, index }) => (
    <div className="route-card">
      <div className="route-header">
        <div className="route-number">#{index + 1}</div>
        <div className="route-path">
          <span className="route-code">{route.source}</span>
          <span className="route-arrow">→</span>
          <span className="route-code">{route.destination}</span>
        </div>
        <div className="route-type-badge">{route.routeType}</div>
      </div>
      
      <div className="route-stats">
        <div className="route-stat">
          <span className="route-stat-label">Trips:</span>
          <span className="route-stat-value">{route.tripCount}</span>
        </div>
        {route.averageTimeInHoursBetweenBookingAndDeparture && (
          <div className="route-stat">
            <span className="route-stat-label">Avg Booking Time:</span>
            <span className="route-stat-value">{formatTime(route.averageTimeInHoursBetweenBookingAndDeparture)}</span>
          </div>
        )}
        {route.mealBookedCount !== undefined && (
          <div className="route-stat">
            <span className="route-stat-label">Meals Booked:</span>
            <span className="route-stat-value">{route.mealBookedCount}</span>
          </div>
        )}
      </div>

      {route.airlinePreferencePercentage && Object.keys(route.airlinePreferencePercentage).length > 0 && (
        <PreferenceGrid 
          title="Airline Preference" 
          preferences={route.airlinePreferencePercentage} 
        />
      )}
      
      {route.seatPreferencePercentage && (
        <PreferenceGrid 
          title="Seat Preference" 
          preferences={route.seatPreferencePercentage} 
        />
      )}

      {route.departureTimePreferencePercentage && (
        <PreferenceGrid 
          title="Departure Time Preference" 
          preferences={route.departureTimePreferencePercentage} 
        />
      )}

      {route.flightWithStopsPercentage && (
        <PreferenceGrid 
          title="Flight Type" 
          preferences={route.flightWithStopsPercentage} 
        />
      )}
    </div>
  );

  return (
    <div className="persona-display">
      <h3 className="persona-title">Your Travel Persona</h3>
      <div className="persona-content">
        {/* Flight Statistics */}
        {persona.flightsInLast12Months && (
          <div className="persona-section-card">
            <h4 className="section-title">📊 Flight Statistics</h4>
            <div className="stats-grid">
              <StatCard 
                title="Domestic Flights" 
                value={persona.flightsInLast12Months.domestic || 0}
                subtitle="Last 12 months"
                icon="✈️"
              />
              <StatCard 
                title="International Flights" 
                value={persona.flightsInLast12Months.international || 0}
                subtitle="Last 12 months"
                icon="🌍"
              />
              {persona.platformUsedToBookTripsUniqueCount !== undefined && (
                <StatCard 
                  title="Booking Platforms" 
                  value={persona.platformUsedToBookTripsUniqueCount}
                  subtitle="Unique platforms used"
                  icon="📱"
                />
              )}
            </div>
          </div>
        )}

        {/* Booking Preferences */}
        <div className="persona-section-card">
          <h4 className="section-title">🎯 Booking Preferences</h4>
          <div className="preferences-container">
            {persona.mealBookedPercentage !== undefined && (
              <ProgressBar label="Meal Booking" value={persona.mealBookedPercentage} />
            )}
            {persona.seatBookedPercentage !== undefined && (
              <ProgressBar label="Seat Booking" value={persona.seatBookedPercentage} />
            )}
            {persona.conviencenessFeePaidPercentage !== undefined && (
              <ProgressBar label="Convenience Fee Paid" value={persona.conviencenessFeePaidPercentage} />
            )}
            {persona.averageTimeInHoursBetweenBookingAndDeparture !== undefined && (
              <div className="stat-item">
                <span className="stat-item-label">Average Booking Time</span>
                <span className="stat-item-value">
                  {formatTime(persona.averageTimeInHoursBetweenBookingAndDeparture)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Seat Preferences */}
        {persona.seatPreferencePercentage && (
          <div className="persona-section-card">
            <h4 className="section-title">💺 Seat Preferences</h4>
            <PreferenceGrid title="" preferences={persona.seatPreferencePercentage} />
          </div>
        )}

        {/* Class Preferences */}
        {persona.classPreferencePercentage && (
          <div className="persona-section-card">
            <h4 className="section-title">🎫 Class Preferences</h4>
            <PreferenceGrid title="" preferences={persona.classPreferencePercentage} />
          </div>
        )}

        {/* Departure Time Preferences */}
        {persona.departureTimePreferencePercentage && (
          <div className="persona-section-card">
            <h4 className="section-title">🕐 Departure Time Preferences</h4>
            <PreferenceGrid title="" preferences={persona.departureTimePreferencePercentage} />
          </div>
        )}

        {/* Flight Type Preferences */}
        {persona.flightWithStopsPercentage && (
          <div className="persona-section-card">
            <h4 className="section-title">🛫 Flight Type Preferences</h4>
            <PreferenceGrid title="" preferences={persona.flightWithStopsPercentage} />
          </div>
        )}

        {/* Airline Preferences */}
        {persona.airlinePreferencePercentage && Object.keys(persona.airlinePreferencePercentage).length > 0 && (
          <div className="persona-section-card">
            <h4 className="section-title">✈️ Airline Preferences</h4>
            <PreferenceGrid title="" preferences={persona.airlinePreferencePercentage} />
          </div>
        )}

        {/* Top Routes */}
        {persona.topRoutes && persona.topRoutes.length > 0 && (
          <div className="persona-section-card">
            <h4 className="section-title">🗺️ Top Routes</h4>
            <div className="routes-container">
              {persona.topRoutes.map((route, index) => (
                <RouteCard key={index} route={route} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [redirectUrl, setRedirectUrl]=useState("")
  const [accountId, setAccountId]=useState("")
  const [userId,setUserId]=useState("")
  const [userPersona, setUserPersona] = useState(null)
  const [isLoadingPersona, setIsLoadingPersona] = useState(false)
 
  const hasCalledWebhook = useRef(false);


  useEffect(() => {
    const savedUserId = localStorage.getItem("user_id");
    const savedAccountId = localStorage.getItem("account_id");
    const savedPersona = localStorage.getItem("user_persona");
    
    if (savedUserId) {
      setUserId(savedUserId);
    }
    
    if (savedAccountId) {
      setAccountId(savedAccountId);
    }
    
    if (savedPersona) {
      try {
        const parsedPersona = JSON.parse(savedPersona);
        setUserPersona(parsedPersona);
      } catch (error) {
        console.error("Error parsing saved persona:", error);
      }
    }
  }, []);

  useEffect(() => {
   const params = new URLSearchParams(window.location.search);
 
   const success = params.get("status");
   const returnedAccountId = params.get("connected_account_id");
   const savedUserId = localStorage.getItem("user_id");
  setUserId(savedUserId)
   
   const webhookCalledKey = `webhook_called_${returnedAccountId}`;
   const alreadyCalled = localStorage.getItem(webhookCalledKey);
   
   if (success && returnedAccountId && !hasCalledWebhook.current && !alreadyCalled) {
     console.log("Success:", success);
     console.log("Account ID:", returnedAccountId);
     
     hasCalledWebhook.current = true;
     
     setAccountId(returnedAccountId);
     localStorage.setItem("account_id", returnedAccountId);
     
     fetch("https://gameskraft.app.n8n.cloud/webhook/d2d9c8e1-f349-4e9f-b11c-e9231c273dba", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         connected_account_id: returnedAccountId,
         entity_id: savedUserId
       }),
     }).then(() => {
       console.log("Webhook called successfully");
       localStorage.setItem(webhookCalledKey, "true");
       window.history.replaceState({}, "", "/");
     }).catch((error) => {
       console.error("Webhook call failed:", error);
       hasCalledWebhook.current = false;
     });
   } else if (success && returnedAccountId && alreadyCalled) {
     setAccountId(returnedAccountId);
     localStorage.setItem("account_id", returnedAccountId);
     window.history.replaceState({}, "", "/");
   }
 }, []);


  useEffect(() => {
    socket.on("chat-message", (msg) => {
      console.log("kkkk")
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("userPersona", (msg) => {
      console.log("Received userPersona:", msg);
      try {
        // Parse the stringified JSON
        const userp=msg.userPersona;
        const parsedPersona = typeof userp === 'string' ? JSON.parse(userp) : userp;
        setUserPersona(parsedPersona);
        // Persist persona to localStorage
        localStorage.setItem("user_persona", JSON.stringify(parsedPersona));
        setIsLoadingPersona(false);
      } catch (error) {
        console.error("Error parsing userPersona:", error);
        setIsLoadingPersona(false);
      }
    });
    
    return () => {
      socket.off("chat-message");
      socket.off("userPersona");
    };
  }, []);

  // Set loading state when accountId exists but no persona yet
  useEffect(() => {
    if (accountId && !userPersona) {
      setIsLoadingPersona(true);
    } else if (userPersona) {
      setIsLoadingPersona(false);
    }
  }, [accountId, userPersona]);

  // useEffect(() => {
  //  localStorage.removeItem("user_persona");
  //  localStorage.removeItem("account_id");
  // }, []);
  async function handleOnClick(){
    try {
      const id = crypto.randomUUID();
       console.log("Kunalllll",id);
       setUserId(id);
       localStorage.setItem("user_id", id);
      const response = await fetch("https://gameskraft.app.n8n.cloud/webhook/45323bb7-0ecb-4946-8f76-a9e283c3a369", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         user_id:id
        }),
      });
       
     const data=await response.json();
     const redirect_url=data[0].redirect_url;
     const acc_id=data[0].connected_account_id;
  
     console.log("Kunal",redirect_url,acc_id);
    //  setAccountId(acc_id)
     window.location.href = redirect_url;
    // window.open(redirect_url, "_blank");
    } catch (error) {
      console.log(error)
    }
   }

   
  return (
    <div className="page">
      <div className="left-side">
        <h2 className="header">Travel AI</h2>
        <ChatBox messages={messages} />
      </div>

      <div className="right-side">
        {userPersona && (
          <>
            <elevenlabs-convai agent-id="agent_0201kadrz4f4ffyahjzxzt3d5abv"></elevenlabs-convai>
            <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
          </>
        )}
        
        <div className="persona-section">
          {!accountId ? (
            <button className="connect-button" onClick={handleOnClick}>
              Connect to gmail
            </button>
          ) : userPersona ? (
            <PersonaDisplay persona={userPersona} />
          ) : isLoadingPersona ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your persona...</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
