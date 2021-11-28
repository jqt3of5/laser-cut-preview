using System.Collections.Generic;
using System.IO;
using System.Linq;
using Core.Data;
using NUnit.Framework;
using Svg;

namespace LaserPreviewTests
{
    [TestFixture]
    public class SvgProcessor_Tests
    {
        [TestCase("EmptySvg.svg")]
        public void TestSubgraphicsWithEmptySvg(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subGraphics = processor.ExtractSubGraphics();
            
            Assert.That(subGraphics, Is.Empty);
            Assert.That(subGraphics, Is.Not.Null);
        } 
        
        [TestCase("EmptySvg.svg")]
        public void TestGraphicWithEmptySvg(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var graphic = processor.CreateGraphicFromSubGraphics("12345", filename);
            
            Assert.That(graphic, Is.Not.Null);
            Assert.That(graphic.name, Is.EqualTo(filename));
            Assert.That(graphic.guid, Is.EqualTo("12345"));
            Assert.That(graphic.colorModes, Is.Not.Null.And.Empty);
            Assert.That(graphic.posX.value, Is.Zero);
            Assert.That(graphic.posY.value, Is.Zero);
            Assert.That(graphic.height.value, Is.Zero);
            Assert.That(graphic.width.value, Is.Zero);
        } 
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        public void TestSubGraphicsOnNonEmptySvg(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphics();
           
            Assert.That(subgraphics, Is.Not.Null.And.Not.Empty);
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestSubGraphicsColor(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphics();

            IEnumerable<SvgElement> ChildElements(SvgElement element)
            {
                if (element.Children.Any())
                {
                    foreach (var child in element.Children)
                    {
                        foreach (var childElement in ChildElements(child))
                        {
                            yield return childElement;
                        }
                    }
                }
                else
                {
                    yield return element;
                }
            }
            
            Assert.Multiple(() =>
            {
                Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
                foreach (var subgraphic in subgraphics)
                {
                    Assert.That(ChildElements(subgraphic.document), Is.All.Matches<SvgElement>(e =>
                    {
                        if (e.Stroke == SvgPaintServer.None)
                        {
                            return true;
                        }
                        
                        if (e.Stroke is SvgColourServer strokeServer)
                        {
                            return strokeServer.Colour == subgraphic.subGraphic.color;
                        }

                        return true;
                    }));
                    
                    Assert.That(ChildElements(subgraphic.document), Is.All.Matches<SvgElement>(e =>
                    {
                        if (e.Fill == SvgPaintServer.None)
                        {
                            return true;
                        }
                        if (e.Fill is SvgColourServer fillServer)
                        {
                            return fillServer.Colour == subgraphic.subGraphic.color;
                        }

                        return true;
                    }));
                } 
            });
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestSubDocumentBoundsAreSameAsSubGraphic(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphics();
           
            Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
            
            foreach (var subgraphic in subgraphics)
            {
                Assert.That(subgraphic.document.Height.Value, Is.EqualTo(subgraphic.subGraphic.height.value));
                Assert.That(subgraphic.document.Width.Value, Is.EqualTo(subgraphic.subGraphic.width.value));
            }
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestAllSubGraphicsHaveSameUnits(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphics();
           
            Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
            
            Assert.Multiple(() =>
            {
                foreach (var subgraphic in subgraphics)
                {
                    Assert.That(subgraphic.document.Width.Type, Is.EqualTo(originalSvg.Width.Type));
                    Assert.That(subgraphic.document.Height.Type, Is.EqualTo(originalSvg.Height.Type));
                    Assert.That(subgraphic.subGraphic.posX.unit, Is.EqualTo(originalSvg.Width.Type.ToUnits()));
                    Assert.That(subgraphic.subGraphic.width.unit, Is.EqualTo(originalSvg.Width.Type.ToUnits()));
                    Assert.That(subgraphic.subGraphic.height.unit, Is.EqualTo(originalSvg.Height.Type.ToUnits()));
                
                } 
            });
        }
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestDocumentBoundsAreSameAsSubGraphic(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphics();

            Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
            
            var graphic = processor.CreateGraphicFromSubGraphics("1234", "test");

            var width = subgraphics.Max(tuple => tuple.subGraphic.posX.value + tuple.subGraphic.width.value) - subgraphics.Min(tuple => tuple.subGraphic.posX.value);
            var height = subgraphics.Max(tuple => tuple.subGraphic.posY.value + tuple.subGraphic.height.value) - subgraphics.Min(tuple => tuple.subGraphic.posY.value);

            Assert.That(width, Is.EqualTo(graphic.width.value));
            Assert.That(height, Is.EqualTo(graphic.height.value));
        }  
       
    }
}