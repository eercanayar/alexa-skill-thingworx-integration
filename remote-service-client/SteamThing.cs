using System.Diagnostics;
using com.thingworx.common.logging;
using com.thingworx.communications.client;
using com.thingworx.communications.client.things;
using com.thingworx.metadata;
using com.thingworx.metadata.annotations;
using com.thingworx.metadata.collections;
using com.thingworx.types;
using com.thingworx.types.collections;
using com.thingworx.types.constants;
using com.thingworx.types.primitives;
using System;
using System.Text;
using System.Threading;
using System.Net;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;

// Refer to the "Steam Sensor Example" section of the documentation
// for a detailed explanation of this example's operation 
namespace SteamSensorConsole
{


    // Steam Thing virtual thing class that simulates a Steam Sensor
    public class SteamThing : VirtualThing
    {
        private static readonly TraceSource _logger = LoggerFactory.getLogger(typeof(SteamThing));

        // Lock and bool field used to keep the shutdown logic from occuring multiple times before the actual shutdown
        private object _shutdownLock = new object();

        public SteamThing(string name, string description, string identifier, ConnectedThingClient client)
            : base(name, description, identifier, client)
        {
        
            // Populate the thing shape with the properties, services, and events that are annotated in this code
            base.initializeFromAnnotations();
        }

        // From the VirtualThing class
        // This method will get called when a connect or reconnect happens
        // Need to send the values when this happens
        // This is more important for a solution that does not send its properties on a regular basis
        public override void synchronizeState()
        {
            // Be sure to call the base class
            base.synchronizeState();
            // Send the property values to Thingworx when a synchronization is required
            base.syncProperties();
        }

        // The processScanRequest is called by the SteamSensorClient every scan cycle
        public override void processScanRequest()
        {
            // Be sure to call the base classes scan request
            base.processScanRequest();
        }

        [method: ThingworxServiceDefinition(name = "TakePhoto", description = "Add Two Numbers")]
        [return: ThingworxServiceResult(name = CommonPropertyNames.PROP_RESULT, description = "Result", baseType = "STRING")]

        public string TakePhoto()
        {
            Console.WriteLine("[" + DateTime.Now.ToString("HH:mm:ss.fff") + "] Service fired.");
            
            string base64String = "nothing";

            WebClient wc = new WebClient();
            byte[] bytes = { };
            try
            {
                bytes = wc.DownloadData(SteamSensorClient.CameraIp + "img/snapshot.cgi?size=3&quality=1");
            } catch
            {
                Console.WriteLine("[" + DateTime.Now.ToString("HH:mm:ss.fff") + "] Taking photo failed. Obtaining IP again...");
                SteamSensorClient.FindCameraIp();
                bytes = wc.DownloadData(SteamSensorClient.CameraIp + "img/snapshot.cgi?size=3&quality=1");
            }
            MemoryStream ms = new MemoryStream(bytes);
            System.Drawing.Image image = System.Drawing.Image.FromStream(ms);

            using (MemoryStream m = new MemoryStream())
            {
                image.Save(m, image.RawFormat);
                byte[] imageBytes = m.ToArray();
                base64String = Convert.ToBase64String(imageBytes);
            }

            Console.WriteLine("[" + DateTime.Now.ToString("HH:mm:ss.fff") + "] Response is sent.");
            return base64String;
        }

        

    }
}
