using System.Diagnostics;
using com.thingworx.common.logging;
using com.thingworx.communications.client;
using com.thingworx.communications.client.things;
using com.thingworx.communications.common;
using System;
using System.Threading;
using System.Configuration;
using System.Net.Http;
using System.Threading.Tasks;

// Refer to the "Steam Sensor Example" section of the documentation
// for a detailed explanation of this example's operation 
namespace SteamSensorConsole
{
    public class SteamSensorClient : ConnectedThingClient
    {
        private static readonly TraceSource _logger = LoggerFactory.getLogger(typeof(SteamSensorClient));

        public SteamSensorClient(ClientConfigurator config) 
            : base(config)
        {
	    }

        private void startClient(object state)
        {
            start();
        }

        private void runClient(object state)
        {
            // Loop over all the Virtual Things and process them
            foreach (VirtualThing thing in getThings().Values)
            {
                try
                {
                    thing.processScanRequest();
                }
                catch (Exception eProcessing)
                {
                    Console.WriteLine("Error Processing Scan Request for [" + thing.getName() + "] : " + eProcessing.Message);
                }
            }
        }

        static void Main(string[] args)
        {
            /*if(args.Length < 3) 
            {
			    Console.WriteLine("Required arguments not found!");
			    Console.WriteLine("URI AppKey ScanRate");
			    Console.WriteLine("Example:");
                Console.WriteLine("SteamSensorClient.exe wss://localhost:443/Thingworx/WS xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 1000");
                return;
		    }*/

            // Set the required configuration information
            var config = new ClientConfigurator();

            // Set the size of the threadpools
            config.MaxMsgHandlerThreadCount = 8;
            config.MaxApiTaskerThreadCount = 8;


            /***** WARNING: For Development purposes only. Do not use these settings in a production environment. *****/
            config.AllowSelfSignedCertificates = true;
            config.DisableCertValidation = true;
            /***** WARNING *****/

            // The uri for connecting to Thingworx
            config.Uri = ConfigurationManager.AppSettings["config.Uri"].ToString();

            // Reconnect every 15 seconds if a disconnect occurs or if initial connection cannot be made
            config.ReconnectInterval = 15;

            // Set the security using an Application Key
            var appKey = ConfigurationManager.AppSettings["appKey"].ToString();

            var claims = SecurityClaims.fromAppKey(appKey);
            config.Claims = claims;

            // Set the name of the client
            config.Name = "TakePhotoGateway";
            config.MaxMessageSize = 1048576;

            // Get the scan rate (milliseconds) that is specific to this example
            // The example will execute the processScanRequest of the VirtualThing
            // based on this scan rate
            int scanRate = 1000;

            // Create the client passing in the configuration from above
            SteamSensorClient client = new SteamSensorClient(config);

            // prepare the camera IP
            FindCameraIp();
          
            try
            {
                // Create two Virtual Things 
                SteamThing sensor1 = new SteamThing("AlexaAgentTR", "desc", null, client);
               // SteamThing sensor2 = new SteamThing("SteamSensor2", "2nd Floor Steam Sensor", "SN0002", client);

                // Bind the Virtual Things
                client.bindThing(sensor1);
               // client.bindThing(sensor2);

                // Start the client
                ThreadPool.QueueUserWorkItem(client.startClient);
            }
            catch (Exception eStart)
            {
                Console.WriteLine("Initial Start Failed : " + eStart.Message);
            }

            
            // Wait for the SteamSensorClient to connect, then process its associated things.
            // As long as the client has not been shutdown, continue
            while (!client.isShutdown())
            {
                // Only process the Virtual Things if the client is connected
                if (client.isConnected())
                {
                    ThreadPool.QueueUserWorkItem(client.runClient);
                }
                
                // Suspend processing at the scan rate interval
                Thread.Sleep(scanRate);
            }
        }

        public static void FindCameraIp()
        {
            CameraIp = "";
            var tl = new Task<HttpResponseMessage>[256];
            for (int i = 0; i < 256; i++)
            {
                var ip = "http://192.168.70." + i + "/";
                HttpClient hc = new HttpClient();
                hc.BaseAddress = new Uri(ip);
                hc.Timeout = TimeSpan.FromSeconds(4);
                tl[i] = hc.GetAsync(@"img/snapshot.cgi?size=3&quality=1");
            }
            try
            {
                Task.WaitAll(tl);
            }
            catch (AggregateException)
            {

            }
            for (int i = 0; i < 256; i++)
            {
                if (tl[i].Status == TaskStatus.RanToCompletion && tl[i].Result.IsSuccessStatusCode)
                {
                    CameraIp = "http://192.168.70." + i + "/";
                    break;
                }
            }

            if (CameraIp == "") {
                Console.WriteLine("[" + DateTime.Now.ToString("HH:mm:ss.fff") + "] IP camera not found! Scaninng again...");
                FindCameraIp();
            } else { 
                Console.WriteLine("["+DateTime.Now.ToString("HH:mm:ss.fff") + "] IP scan ends: " + CameraIp);
            }
        }
        
        public static string CameraIp { get; set; }
    }
}
