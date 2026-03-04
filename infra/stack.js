import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load local .env for deployment (to pass secrets to Lambda)
dotenv.config({ path: path.join(__dirname, "../.env") });

export class WeddingStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // 1. The Hono API Lambda
    const apiLambda = new lambda.NodejsFunction(this, "WeddingApi", {
      entry: path.join(__dirname, "../src/server/lambda.js"),
      handler: "handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL || "",
        ADMIN_SECRET: process.env.ADMIN_SECRET || "",
        PORT: "3001",
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["pg-native"],
        format: lambda.OutputFormat.ESM,
        banner:
          "import { createRequire } from 'module'; const require = createRequire(import.meta.url);", // Needed for some commonjs modules in ESM
      },
    });

    // 2. The HTTP API Gateway
    const httpApi = new apigw.HttpApi(this, "WeddingHttpApi", {
      description: "Wedding Invitation API",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: [
          apigw.CorsHttpMethod.GET,
          apigw.CorsHttpMethod.POST,
          apigw.CorsHttpMethod.PATCH,
          apigw.CorsHttpMethod.DELETE,
          apigw.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ["*"], // Restrict this in production to your GitHub Pages URL
      },
    });

    // 3. Integrate Lambda with API Gateway
    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [apigw.HttpMethod.ANY],
      integration: new HttpLambdaIntegration("ApiIntegration", apiLambda),
    });

    // Output the API URL
    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
      description: "The URL of the API Gateway",
    });
  }
}
