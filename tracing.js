const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");
const { trace } = require("@opentelemetry/api");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Exporter
module.exports = (serviceName) => {
   const jaegerExporter = new JaegerExporter({
       endpoint: "http://localhost:14268/api/traces", // Jaeger's endpoint for receiving traces
   });
   const consoleExporter = new ConsoleSpanExporter(); // For debugging in terminal

   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });

   // Add both exporters to the provider
   provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
   provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter)); // Debugging

   provider.register();

   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   return trace.getTracer(serviceName);
};
